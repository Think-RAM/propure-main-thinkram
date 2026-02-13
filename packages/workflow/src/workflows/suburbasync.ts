import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";
import type { Doc } from "@propure/convex/genereated";
import { addressToCoordinatesGoogle } from "../utils/map";

const parsePrice = (value?: string | number | null): number | null => {
    if (value == null) return null;

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    // Extract digits only (handles "$650 pw", "AUD 700", etc.)
    const cleaned = value.replace(/[^\d]/g, "");
    if (!cleaned) return null;

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};

const getRentalPrice = (
    property: Doc<"properties">
): number | null => {
    // 1️⃣ Direct price takes priority
    const directPrice = parsePrice(property.price);
    if (directPrice !== null) {
        return directPrice;
    }

    // 2️⃣ Range average (from + to)
    const from = parsePrice(property.priceFrom);
    const to = parsePrice(property.priceTo);

    if (from !== null && to !== null) {
        return Math.round((from + to) / 2);
    }

    // 3️⃣ Single-sided range fallback
    if (from !== null) return from;
    if (to !== null) return to;

    // 4️⃣ Nothing usable
    return null;
};

const clamp = (value: number, min = 0, max = 1) =>
    Math.max(min, Math.min(max, value));

const ratioScore = (actual: number, ideal: number) =>
    clamp(actual / ideal);

const THRESHOLDS = {
    minSales: 20,
    minRentals: 15,
    minABSRecords: 1,
    idealSales: 50,
    idealRentals: 40,
};


async function fetchAllSoldPropertiesForSuburb(
    suburb: string,
    state: string,
    postcode: string
) {
    "use step";

    const PAGE_SIZE = 100;

    try {
        // 1️⃣ Fetch first page to know totalPages
        const firstPage = await client.query(
            api.functions.properties.fetchProperties,
            {
                locations: [{ suburb, state, postcode }],
                listingType: "sold",
                page: 1,
                pageSize: PAGE_SIZE,
            }
        );

        const totalPages = firstPage.totalPages;

        // If only one page, return early
        if (totalPages <= 1) {
            return firstPage.data;
        }

        // 2️⃣ Create parallel requests for remaining pages
        const pagePromises = Array.from(
            { length: totalPages - 1 },
            (_, i) =>
                client.query(api.functions.properties.fetchProperties, {
                    locations: [{ suburb, state, postcode }],
                    listingType: "sold",
                    page: i + 2, // pages start from 2
                    pageSize: PAGE_SIZE,
                })
        );

        // 3️⃣ Fetch all pages in parallel
        const remainingPages = await Promise.all(pagePromises);

        // 4️⃣ Merge results
        const allProperties = [
            ...firstPage.data,
            ...remainingPages.flatMap((res) => res.data),
        ];

        return allProperties;
    } catch (error) {
        console.error(
            `Failed to fetch properties for suburb ${suburb}:`,
            error
        );
        throw error;
    }
}

async function fetchAllRentPropertiesForSuburb(
    suburb: string,
    state: string,
    postcode: string
) {
    "use step";

    const PAGE_SIZE = 100;

    try {
        // 1️⃣ Fetch first page to know totalPages
        const firstPage = await client.query(
            api.functions.properties.fetchProperties,
            {
                locations: [{ suburb, state, postcode }],
                listingType: "rent",
                page: 1,
                pageSize: PAGE_SIZE,
            }
        );

        const totalPages = firstPage.totalPages;

        // If only one page, return early
        if (totalPages <= 1) {
            return firstPage.data;
        }

        // 2️⃣ Create parallel requests for remaining pages
        const pagePromises = Array.from(
            { length: totalPages - 1 },
            (_, i) =>
                client.query(api.functions.properties.fetchProperties, {
                    locations: [{ suburb, state, postcode }],
                    listingType: "rent",
                    page: i + 2, // pages start from 2
                    pageSize: PAGE_SIZE,
                })
        );

        // 3️⃣ Fetch all pages in parallel
        const remainingPages = await Promise.all(pagePromises);

        // 4️⃣ Merge results
        const allProperties = [
            ...firstPage.data,
            ...remainingPages.flatMap((res) => res.data),
        ];

        return allProperties;
    } catch (error) {
        console.error(
            `Failed to fetch properties for suburb ${suburb}:`,
            error
        );
        throw error;
    }
}

async function fetchAllAbsSuburbData(suburb: string, postcode: string) {
    "use step";
    try {
        const absDemographicData = await client.query(api.functions.absMarketData.getAbsMarketDataByPostcode, { postcode });

        return absDemographicData;
    } catch (error) {
        console.error(`Failed to fetch ABS suburb data for suburb ${suburb}:`, error);
        throw error;
    }
}

async function calculateSuburbMetrics(
    saleProperties: Doc<"properties">[],
    renterProperties: Doc<"properties">[],
    absData: Doc<"absMarketData">
) {
    "use step";

    // ---------- helpers ----------
    const safeDivide = (num: number, den: number) =>
        den > 0 ? num / den : null;

    const safePercent = (num: number, den: number) =>
        den > 0 ? (num / den) * 100 : null;

    const safeAverage = (values: number[]) =>
        values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

    // ---------- SALES ----------
    const soldProperties = saleProperties
        .filter((p) => typeof p.soldPrice === "number")
        .sort((a, b) => b.soldPrice! - a.soldPrice!);

    const soldPrices = soldProperties.map((p) => p.soldPrice!);

    const typicalValue = safeAverage(soldPrices);

    const medianValue =
        soldPrices.length === 0
            ? null
            : soldPrices.length % 2 === 0
                ? (soldPrices[soldPrices.length / 2 - 1] +
                    soldPrices[soldPrices.length / 2]) /
                2
                : soldPrices[Math.floor(soldPrices.length / 2)];

    const daysOnMarketValues = soldProperties
        .map((p) => Number(p.daysOnMarket))
        .filter(Number.isFinite);

    const averageDaysOnMarket = safeAverage(daysOnMarketValues);

    const auctionClearanceRate = safePercent(
        soldProperties.filter((p) => p.soldAt === "AUCTION").length,
        soldProperties.length
    );

    // ---------- ABS / TENURE ----------
    const avgRenters = absData.rented ?? 0;

    const avgOwners = absData.ownerOccupied ?? 0;

    const totalTenure =
        avgRenters !== null && avgOwners !== null
            ? avgRenters + avgOwners
            : null;

    const renterProportion =
        avgRenters !== null && totalTenure
            ? safePercent(avgRenters, totalTenure)
            : null;

    // ---------- VACANCY ----------
    const vacancyRate =
        avgRenters !== null
            ? safePercent(renterProperties.length, avgRenters)
            : null;

    // ---------- RENT / YIELD ----------
    const rentalPrices = renterProperties
        .map((p) => getRentalPrice(p))
        .filter((v): v is number => typeof v === "number");

    const averageWeeklyRent = safeAverage(rentalPrices);

    const grossAnnualRent =
        averageWeeklyRent !== null ? averageWeeklyRent * 52 : null;

    const vacancyAdjustedRent =
        grossAnnualRent !== null && vacancyRate !== null
            ? grossAnnualRent * (1 - vacancyRate / 100)
            : null;

    const annualExpenses =
        typicalValue !== null ? typicalValue * 0.1 : null;

    const netAnnualIncome =
        vacancyAdjustedRent !== null && annualExpenses !== null
            ? vacancyAdjustedRent - annualExpenses
            : null;

    const netYield =
        netAnnualIncome !== null && typicalValue
            ? safePercent(netAnnualIncome, typicalValue)
            : null;

    // ---------- STOCK ON MARKET ----------
    const numberOfPropertiesOnMarket =
        saleProperties.length - soldProperties.length;

    const stockOnMarket =
        totalTenure !== null
            ? safePercent(numberOfPropertiesOnMarket, totalTenure)
            : null;

    // ---------- DATA COMPLETENESS ----------
    const salesCount = soldProperties.length;
    const rentalCount = renterProperties.length;

    const salesVolumeScore = ratioScore(
        salesCount,
        THRESHOLDS.idealSales
    );

    const salesFieldCompleteness =
        soldProperties.reduce((sum, p) => {
            let score = 0;
            if (p.soldPrice != null) score++;
            if (p.daysOnMarket != null) score++;
            if (p.soldAt != null) score++;
            return sum + score / 3;
        }, 0) / Math.max(salesCount, 1);

    const salesScore =
        salesVolumeScore * 0.6 + salesFieldCompleteness * 0.4;

    const rentalVolumeScore = ratioScore(
        rentalCount,
        THRESHOLDS.idealRentals
    );

    const rentalFieldCompleteness =
        renterProperties.reduce((sum, p) => {
            let score = 0;
            if (getRentalPrice(p) != null) score++;
            if (p.features?.bedrooms != null) score++;
            return sum + score / 2;
        }, 0) / Math.max(rentalCount, 1);

    const rentalScore =
        rentalVolumeScore * 0.6 + rentalFieldCompleteness * 0.4;

    const samplePenalty =
        salesCount < 10 || rentalCount < 8 ? 0.6 : 1;

    const dataCompletenessScore = Math.round(
        (
            salesScore * 0.55 +
            rentalScore * 0.35 +
            samplePenalty * 0.1
        ) * 100
    );

    // ---------- RETURN ----------
    return {
        typicalValue,
        medianValue,
        averageDaysOnMarket,
        auctionClearanceRate,
        renterProportion,
        vacancyRate,
        netYield,
        stockOnMarket,
        dataCompletenessScore,
    };
}

async function updateSuburbMetricsInDb(metrics: Awaited<ReturnType<typeof calculateSuburbMetrics>>, suburb: string, postcode: string) {
    "use step";
    try {
        const suburbId = await client.query(api.functions.suburb.getSuburbIdByName, { postcode });
        const geometry = await addressToCoordinatesGoogle(`${suburb} VIC ${postcode}`);
        if(!geometry) {
            throw new Error("Failed to geocode suburb location");
        }
        await client.mutation(api.functions.suburbMetrics.upsertSuburbMetricsData, {
            suburbId,
            suburbGeometry: {
                center: {
                    lat: geometry.lat,
                    lng: geometry.lng,
                },
                boundary: geometry.bbounds ? geometry.bbounds : {
                    northeast: {
                        lat: geometry.lat + 0.01,
                        lng: geometry.lng + 0.01,
                    },
                    southwest: {
                        lat: geometry.lat - 0.01,
                        lng: geometry.lng - 0.01,
                    },
                },
            },
            metrics: {
                typicalValue: metrics.typicalValue ?? 0,
                medianValue: metrics.medianValue ?? 0,
                averageDaysOnMarket: metrics.averageDaysOnMarket ?? 0,
                auctionClearanceRate: metrics.auctionClearanceRate ?? 0,
                renterProportion: metrics.renterProportion ?? 0,
                vacancyRate: metrics.vacancyRate ?? 0,
                netYield: metrics.netYield ?? 0,
                stockOnMarket: metrics.stockOnMarket ?? 0,
                // TODO: Calculate these properly in future iterations - placeholders for now
                // Placeholders for new metrics - to be calculated and updated in future iterations
                capitalGrowthScore: 0,
                riskScore: 0,
                cashFlowScore: 0,
                dataCompletenessScore: metrics.dataCompletenessScore,
            },
        });
    } catch (error) {
        console.error(`Failed to update suburb metrics for ${suburb}:`, error);
        throw error;
    }
}


export async function suburbAsyncWorkflow(
    locations: Array<{ suburb: string; state: string; postcode: string }>
): Promise<{
    updatedSuburbs: string[];
    failedSuburbs: string[];
    successCount: number;
    failureCount: number;
    success: boolean;
    errors: Array<{ suburb: string; error: string }>;
    error?: string;
}> {
    "use workflow";

    const CONCURRENCY_LIMIT = 5;

    const results: Array<{
        suburb: string;
        success: boolean;
        error?: string;
    }> = [];

    const processLocation = async (loc: {
        suburb: string;
        state: string;
        postcode: string;
    }) => {
        try {
            const [saleProperties, renterProperties, absData] =
                await Promise.all([
                    fetchAllSoldPropertiesForSuburb(
                        loc.suburb,
                        loc.state,
                        loc.postcode
                    ),
                    fetchAllRentPropertiesForSuburb(
                        loc.suburb,
                        loc.state,
                        loc.postcode
                    ),
                    fetchAllAbsSuburbData(loc.suburb, loc.postcode),
                ]);

            if (!absData) {
                throw new Error("No ABS data available for this suburb");
            }

            const metrics = await calculateSuburbMetrics(
                saleProperties,
                renterProperties,
                absData
            );

            await updateSuburbMetricsInDb(
                metrics,
                loc.suburb,
                loc.postcode
            );

            results.push({
                suburb: loc.suburb,
                success: true,
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : String(err);

            console.error(
                `Workflow failed for suburb ${loc.suburb}:`,
                message
            );

            results.push({
                suburb: loc.suburb,
                success: false,
                error: message,
            });
        }
    };

    try {
        // -------- batch execution with concurrency limit --------
        for (let i = 0; i < locations.length; i += CONCURRENCY_LIMIT) {
            const batch = locations.slice(i, i + CONCURRENCY_LIMIT);

            await Promise.all(
                batch.map((loc) => processLocation(loc))
            );
        }

        // -------- aggregate results --------
        const updatedSuburbs = results
            .filter((r) => r.success)
            .map((r) => r.suburb);

        const failedSuburbs = results
            .filter((r) => !r.success)
            .map((r) => r.suburb);

        const errors = results
            .filter((r) => !r.success && r.error)
            .map((r) => ({
                suburb: r.suburb,
                error: r.error!,
            }));

        return {
            updatedSuburbs,
            failedSuburbs,
            successCount: updatedSuburbs.length,
            failureCount: failedSuburbs.length,
            success: failedSuburbs.length === 0,
            errors,
        };
    } catch (error) {
        // This should only trigger on truly fatal workflow issues
        console.error("Suburb workflow failed catastrophically:", error);

        return {
            success: false,
            updatedSuburbs: [],
            failedSuburbs: [],
            successCount: 0,
            failureCount: locations.length,
            errors: locations.map((l) => ({
                suburb: l.suburb,
                error: "Workflow aborted",
            })),
            error:
                error instanceof Error ? error.message : String(error),
        };
    }
}
