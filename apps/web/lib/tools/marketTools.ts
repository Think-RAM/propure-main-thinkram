import { tool } from "ai";
import { domainTools, marketTools, realestateTools } from "../mcp/client";
import { AustralianState } from "@propure/mcp-shared/schemas";
import z from "zod";

export const getSuburbStats = tool({
    description: "Domain suburb statistics",
    inputSchema: z.object({
        suburb: z.string(),
        state: z.enum([
            "NSW",
            "VIC",
            "QLD",
            "WA",
            "SA",
            "TAS",
            "NT",
            "ACT",
        ]),
        postcode: z.string(),
    }),
    execute: async (p) =>
        domainTools.getSuburbStats(
            p.suburb,
            p.state as AustralianState,
            p.postcode,
        ),
});

export const getSuburbProfile = tool({
    description: "REA suburb demographics and trends",
    inputSchema: z.object({
        suburb: z.string(),
        state: z.enum([
            "NSW",
            "VIC",
            "QLD",
            "WA",
            "SA",
            "TAS",
            "NT",
            "ACT",
        ]),
        postcode: z.string(),
    }),
    execute: async (p) =>
        realestateTools.getSuburbProfile(
            p.suburb,
            p.state as AustralianState,
            p.postcode,
        ),
})

export const getDemographics = tool({
    description: "ABS demographics data",
    inputSchema: z.object({
        suburb: z.string().optional(),
        lga: z.string().optional(),
        state: z
            .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
            .optional(),
    }),
    execute: async (p) =>
        marketTools.getAbsDemographics(
            p.suburb,
            p.lga,
            p.state as AustralianState | undefined,
        ),
})

export const getPopulationProjections = tool({
    description: "Population growth projections",
    inputSchema: z.object({
        state: z
            .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
            .optional(),
    }),
    execute: async (p) =>
        marketTools.getPopulationProjections(
            p.state as AustralianState | undefined,
        ),
})

export const getRbaRates = tool({
    description: "RBA cash rate and lending rates",
    inputSchema: z.object({
        includeHistorical: z.boolean().default(true),
    }),
    execute: async (p) =>
        marketTools.getRbaRates(p.includeHistorical, true),
})

export const getEconomicIndicators = tool({
    description: "Macro economic indicators",
    inputSchema: z.object({}),
    execute: async () =>
        marketTools.getEconomicIndicators(),
})