import { Output, stepCountIs, tool, ToolLoopAgent, UIMessageStreamWriter } from 'ai';
import { google } from "@ai-sdk/google";
import { StrategistOutput, strategistOutputSchema } from './strategistAgent';
import { ChatMessageAI } from '@/types/ai';
import z from 'zod';
import Exa from "exa-js";
import { getDemographics, getEconomicIndicators, getPopulationProjections, getRbaRates, getSuburbProfile, getSuburbStats } from '../marketTools';
import { addressToCoordinatesGoogle } from '@/lib/map/geoEncoding';


interface ResearcherAgentProps {
    strategy: StrategistOutput;
    dataStream: UIMessageStreamWriter<ChatMessageAI>
}

enum Website {
    DOMAIN = "www.domain.com.au",
    REAL_ESTATE = "www.realestate.com.au",
}

// --- re-usable types ---
const MoneyAUD = z.object({
    amount: z.number(),
    currency: z.literal("AUD").default("AUD"),
});

const RangeNumber = z.object({
    min: z.number().optional(),
    max: z.number().optional(),
});

// Simple concurrency limiter (no dependency)
async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
    const out: R[] = new Array(items.length);
    let i = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (i < items.length) {
            const idx = i++;
            out[idx] = await fn(items[idx], idx);
        }
    });

    await Promise.all(workers);
    return out;
}

// --- tool output (Researcher Agent output buckets) ---
const ResearcherAgentOutputSchema = z.object({
    marketDataFetching: z.object({
        indicators: z
            .array(
                z.object({
                    name: z.string(), // e.g. "medianRent", "medianPrice", "vacancyRate"
                    value: z.union([z.number(), z.string()]),
                    unit: z.string().optional(), // e.g. "%", "AUD/week"
                    source: z.object({
                        website: z.nativeEnum(Website),
                        url: z.string().optional(),
                        retrievedAt: z.string(),
                    }),
                })
            )
            .default([]),
        notes: z.array(z.string()).default([]),
    }),

    suburbStatistics: z.object({
        suburb: z.string(),
        state: z.string().optional(),
        postcode: z.string().optional(),

        medianPrice: MoneyAUD.optional(),
        medianRentWeekly: MoneyAUD.optional(),
        grossRentalYieldPct: z.number().optional(),
        vacancyRatePct: z.number().optional(),
        daysOnMarket: z.number().optional(),

        demographics: z
            .object({
                population: z.number().optional(),
                householdIncomeMedian: MoneyAUD.optional(),
            })
            .default({}),

        sources: z
            .array(
                z.object({
                    website: z.nativeEnum(Website),
                    url: z.string().optional(),
                    retrievedAt: z.string(),
                })
            )
            .default([]),
    }),

    propertySearches: z.object({
        query: z.object({
            suburb: z.string(),
            state: z.string().optional(),
            propertyTypes: z.array(z.string()).default([]), // e.g. ["house","unit"]
            priceRange: RangeNumber.optional(),
            beds: RangeNumber.optional(),
            baths: RangeNumber.optional(),
            keywords: z.array(z.string()).default([]),
        }),

        listings: z
            .array(
                z.object({
                    title: z.string(),
                    address: z.string().optional(),
                    suburb: z.string(),
                    state: z.string().optional(),
                    postcode: z.string().optional(),

                    priceText: z.string().optional(),
                    beds: z.number().optional(),
                    baths: z.number().optional(),
                    cars: z.number().optional(),

                    url: z.string(),
                    website: z.nativeEnum(Website),

                    // inferred fields
                    estimatedWeeklyRent: MoneyAUD.optional(),
                    estimatedGrossYieldPct: z.number().optional(),

                    listedAt: z.string().optional(),
                })
            )
            .default([]),

        notes: z.array(z.string()).default([]),
    }),

    externalApiCalls: z.object({
        calls: z
            .array(
                z.object({
                    name: z.string(), // e.g. "abs_demographics", "corelogic_proxy", "domain_api"
                    purpose: z.string(),
                    status: z.enum(["planned", "success", "failed", "skipped"]),
                    endpoint: z.string().optional(),
                    error: z.string().optional(),
                })
            )
            .default([]),
    }),

    // convenience fields derived from strategy
    derivedExpectations: z.object({
        targetGrossYieldPct: z.number().optional(),
        targetCashFlowWeekly: MoneyAUD.optional(),
        maxPurchasePrice: MoneyAUD.optional(),
        cashInHand: MoneyAUD.optional(),
        assumptions: z.array(z.string()).default([]),
    }),
});

const WebScraperTool = ({ strategy, dataStream }: ResearcherAgentProps) => {
    return tool({
        description: "Use this tool to scrape relevant information from the web based on the strategic plan provided.",
        inputSchema: z.object({
            website: z.enum([Website.DOMAIN, Website.REAL_ESTATE]).describe("The website to scrape data from."),
            suburbOverride: z
                .object({
                    suburb: z.string(),
                    state: z.string().optional(),
                    postcode: z.string().optional(),
                })
                .optional()
                .describe("Optional manual suburb override."),
            limitListings: z
                .number()
                .int()
                .min(1)
                .max(50)
                .default(15)
                .describe("Max listings to return."),
        }),
        execute: async ({ website, suburbOverride, limitListings }) => {
            const exa = new Exa(process.env.EXA_API_KEY);
            if (!process.env.EXA_API_KEY) throw new Error("Missing EXA_API_KEY env var.");

            const norm = (s?: string) => (s ?? "").trim();
            const filters = strategy.filterRecommendations?.recommendedFilters ?? [];
            const findFilter = (needle: string) =>
                filters.find((f: any) => norm(f.name).toLowerCase().includes(needle));

            const inferredSuburb =
                suburbOverride?.suburb ||
                findFilter("suburb")?.defaultValue ||
                findFilter("location")?.defaultValue ||
                findFilter("area")?.defaultValue ||
                "UNKNOWN_SUBURB";

            const inferredState =
                suburbOverride?.state ||
                (strategy.userProfiling?.context?.geography
                    ? strategy.userProfiling.context.geography.split(",").pop()?.trim()
                    : undefined);

            const propertyTypes =
                findFilter("property")?.options ??
                findFilter("type")?.options ??
                ([] as string[]);

            const parseRangeFromText = (t?: string): { min?: number; max?: number } | undefined => {
                if (!t) return undefined;
                const nums = t.replace(/,/g, "").match(/\d+/g)?.map(Number) ?? [];
                if (nums.length === 0) return undefined;
                if (nums.length === 1) return { min: nums[0] };
                return { min: nums[0], max: nums[1] };
            };

            const priceRange =
                parseRangeFromText(findFilter("price")?.defaultValue) ||
                parseRangeFromText(findFilter("budget")?.defaultValue);

            const beds = parseRangeFromText(findFilter("bed")?.defaultValue);
            const baths = parseRangeFromText(findFilter("bath")?.defaultValue);

            const keywords =
                findFilter("keywords")?.options ??
                findFilter("keyword")?.options ??
                ([] as string[]);

            const query = {
                suburb: inferredSuburb,
                state: inferredState,
                propertyTypes,
                priceRange,
                beds,
                baths,
                keywords,
            };

            const domainFilter =
                website === Website.DOMAIN ? ["domain.com.au"] : ["realestate.com.au"];

            const qParts = [
                `site:${domainFilter[0]}`,
                `rental listing`,
                inferredSuburb !== "UNKNOWN_SUBURB" ? inferredSuburb : "",
                inferredState ? inferredState : "",
                propertyTypes.length ? propertyTypes.join(" OR ") : "",
                keywords.length ? keywords.join(" ") : "",
                beds?.min ? `${beds.min}+ bedroom` : "",
                baths?.min ? `${baths.min}+ bathroom` : "",
            ].filter(Boolean);

            const exaQuery = qParts.join(" ");

            // 1) search
            const searchRes = await exa.search(exaQuery, {
                numResults: Math.min(25, Math.max(limitListings * 3, 12)),
                includeDomains: domainFilter,
            });

            const urls = (searchRes?.results ?? [])
                .map((r: any) => r.url)
                .filter((u: any): u is string => typeof u === "string" && u.length > 0);

            // 2) contents (text + highlights + summary extraction)
            const contentsRes = await exa.getContents(urls, {
                text: { maxCharacters: 10000, includeHtmlTags: false },
                highlights: { numSentences: 3, highlightsPerUrl: 2, query: exaQuery },
                summary: {
                    // This is the key: force Exa to extract address-like fields
                    query:
                        "From this Australian property listing page, extract the full street address (street number + street name), suburb, state and postcode if present. Return only the address line like: '12 Example St, Suburb NSW 2000'. If no street address is present, return best available location text.",
                },
            });

            const byUrl = new Map((contentsRes?.results ?? []).map((c: any) => [c.url, c]));

            const rows = (searchRes?.results ?? []).map((r: any) => {
                const c = byUrl.get(r.url);
                return {
                    ...r,
                    text: c?.text,
                    highlights: c?.highlights,
                    summary: c?.summary,
                };
            });

            // --- extraction helpers ---
            const extractNumber = (re: RegExp, s: string) => {
                const m = s.match(re);
                return m ? Number(m[1]) : undefined;
            };

            const extractBeds = (s: string) =>
                extractNumber(/(\d+)\s*(?:bed|bedroom)s?/i, s) ?? extractNumber(/(\d+)\s*🛏/i, s);

            const extractBaths = (s: string) =>
                extractNumber(/(\d+)\s*(?:bath|bathroom)s?/i, s) ?? extractNumber(/(\d+)\s*🛁/i, s);

            const extractCars = (s: string) => extractNumber(/(\d+)\s*(?:car|garage|parking)/i, s);

            const extractPriceText = (s: string) => {
                const m =
                    s.match(/\$\s?\d{2,5}(?:,\d{3})?\s*(?:pw|\/wk|\/week|per week|week)\b/i) ||
                    s.match(/\$\s?\d{2,5}(?:,\d{3})?\b/i);
                return m?.[0];
            };

            const inferSuburbFromTitle = (title?: string) => {
                if (!title) return undefined;
                const m = title.match(/,\s*([A-Za-z\s]+)\s+(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/i);
                return m?.[1]?.trim();
            };

            // very basic AU address fallback regex (only if summary fails)
            const extractAddressFallback = (blob: string) => {
                // "12 Something St, Suburb NSW 2000"
                const m = blob.match(
                    /\b(\d{1,5}[A-Za-z]?\s+[A-Za-z0-9.\-'\s]+?\s(?:St|Street|Rd|Road|Ave|Avenue|Dr|Drive|Cres|Crescent|Pde|Parade|Blvd|Boulevard|Tce|Terrace|Ct|Court|Pl|Place|Way|Lane|Ln)\s*,\s*[A-Za-z\s]+?\s+(?:NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\s+\d{4})\b/i
                );
                return m?.[1]?.trim();
            };

            // 3) build listings (sync first)
            const preliminary = rows
                .map((r: any) => {
                    const title = norm(r.title) || "Listing";
                    const url = r.url as string;

                    const blob = [title, ...(Array.isArray(r.highlights) ? r.highlights : []), norm(r.text)]
                        .filter(Boolean)
                        .join("\n");

                    const priceText = extractPriceText(blob);
                    const bedsN = extractBeds(blob);
                    const bathsN = extractBaths(blob);
                    const carsN = extractCars(blob);

                    const suburbFromTitle = inferSuburbFromTitle(title);

                    const addressFromSummary = norm(r.summary);
                    const address =
                        addressFromSummary ||
                        extractAddressFallback(blob) ||
                        // last resort: make a geocodable “suburb, state” string
                        (suburbFromTitle || inferredSuburb) +
                        (inferredState ? ` ${inferredState}` : "") +
                        (suburbOverride?.postcode ? ` ${suburbOverride.postcode}` : "");

                    return {
                        title,
                        address,
                        suburb: suburbFromTitle || inferredSuburb,
                        state: inferredState,
                        postcode: suburbOverride?.postcode,
                        latLng: undefined,
                        priceText,
                        beds: bedsN,
                        baths: bathsN,
                        cars: carsN,
                        url,
                        website,
                        estimatedWeeklyRent: undefined,
                        estimatedGrossYieldPct: undefined,
                        listedAt: undefined,
                    };
                })
                .filter((x: any) => /\/(rent|rental|property|listing|details)\b/i.test(x.url))
                .sort((a: any, b: any) => {
                    const score = (x: any) => (x.priceText ? 2 : 0) + (typeof x.beds === "number" ? 1 : 0);
                    return score(b) - score(a);
                })
                .slice(0, limitListings);

            // 4) geocode with concurrency limit (avoid hammering Google)
            const listings = await mapWithConcurrency(preliminary, 4, async (listing) => {
                try {
                    if (!listing.address) return listing;
                    const latLng = await addressToCoordinatesGoogle(listing.address);
                    return { ...listing, latLng };
                } catch {
                    return listing;
                }
            });

            const notes: string[] = [];
            if (inferredSuburb === "UNKNOWN_SUBURB") {
                notes.push(
                    "No suburb could be inferred from strategy; pass suburbOverride or ensure the strategist includes a Suburb filter."
                );
            }
            const missingAddr = listings.filter((l) => !l.address || l.address.includes("UNKNOWN_SUBURB")).length;
            if (missingAddr > 0) {
                notes.push(
                    `Address extraction was incomplete for ${missingAddr} listing(s). Consider increasing Exa text maxCharacters or using a site-specific DOM scraper for best accuracy.`
                );
            }
            const missingGeo = listings.filter((l) => l.address && !l.latLng).length;
            if (missingGeo > 0) {
                notes.push(
                    `Geocoding failed for ${missingGeo} listing(s). Ensure GOOGLE_MAPS_API_KEY is valid and that extracted addresses are specific enough (street + suburb + state + postcode).`
                );
            }

            dataStream.write({
                type: "data-properties-found",
                data: {
                    count: listings.length,
                    suburb: inferredSuburb,
                    listings: listings.filter((l) => l.latLng),
                }
            })

            return {
                propertySearches: { query, listings, notes },
            };
        },

    })
}

const RESEARCHER_INSTRUCTIONS = `You are a meticulous Researcher Agent. Your task is to gather accurate and relevant information based on the strategic plan provided. You will utilize the available tools effectively to find the best possible data that supports the strategy.
Always ensure that the information you provide is well-researched and reliable. Use the tools at your disposal to their fullest potential to assist in your research tasks.`;

const ResearcherAgent = ({ strategy, dataStream }: ResearcherAgentProps) => {
    const agent = new ToolLoopAgent({
        model: google("gemini-2.5-flash"),
        instructions: RESEARCHER_INSTRUCTIONS,
        tools: {
            webScraper: WebScraperTool({ strategy, dataStream }),
            getSuburbStats: getSuburbStats,
            getSuburbProfile: getSuburbProfile,
            getDemographics: getDemographics,
            getPopulationProjections: getPopulationProjections,
            getRbaRates: getRbaRates,
            getEconomicIndicators: getEconomicIndicators,
        },
        output: Output.object({
            schema: ResearcherAgentOutputSchema,
        }),
        stopWhen: stepCountIs(4),
    });

    return agent;
}

export const ResearcherAgentTool = ({ dataStream }: Omit<ResearcherAgentProps, "strategy">) => {
    return tool({
        description: "A research agent that gathers information and refines strategies based on user queries.",
        inputSchema: z.object({
            strategy: strategistOutputSchema.describe("Strategic plan used to infer research goals and data needs."),
            query: z.string().describe("The research question or topic to investigate."),
        }),
        execute: async ({ strategy, query }) => {
            console.log(`Researcher Tool called ${query}`)
            const agent = ResearcherAgent({ strategy, dataStream });
            const result = await agent.generate({ prompt: query })

            console.log("Ouput From Researcher Agent")
            console.dir(result.output, { depth: Infinity });

            return result.output;
        }
    })
}