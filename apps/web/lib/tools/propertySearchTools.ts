import { tool } from "ai";
import { domainTools, realestateTools } from "../mcp/client";
import { AustralianState } from "@propure/mcp-shared";
import z from "zod";

export const searchDomainProperties = tool({
    description: "Search Domain.com.au property listings",
    inputSchema: z.object({
        suburbs: z.array(z.string()).optional(),
        state: z
            .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
            .optional(),
        postcode: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minBeds: z.number().optional(),
        maxBeds: z.number().optional(),
        listingType: z
            .enum(["sale", "rent", "sold"])
            .default("sale"),
        pageSize: z.number().default(10),
    }),
    execute: async (params) => {
        const res = await domainTools.searchProperties({
            ...params,
            state: params.state as AustralianState | undefined,
            page: 1,
        });

        return {
            count: res.listings.length,
            totalCount: res.totalCount,
            hasMore: res.hasMore,
            listings: res.listings,
        };
    },
});

export const searchRealestateProperties = tool({
    description: "Search RealEstate.com.au listings",
    inputSchema: z.object({
        suburbs: z.array(z.string()).optional(),
        state: z
            .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
            .optional(),
        postcode: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minBeds: z.number().optional(),
        listingType: z
            .enum(["sale", "rent", "sold"])
            .default("sale"),
        pageSize: z.number().default(10),
    }),
    execute: async (params) => {
        const res = await realestateTools.searchProperties({
            ...params,
            state: params.state as AustralianState | undefined,
            page: 1,
        });

        return {
            count: res.listings.length,
            totalCount: res.totalCount,
            hasMore: res.hasMore,
            listings: res.listings,
        };
    },
});