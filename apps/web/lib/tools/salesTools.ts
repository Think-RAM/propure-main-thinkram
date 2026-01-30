import { tool } from "ai";
import { domainTools, realestateTools } from "../mcp/client";
import { AustralianState } from "@propure/mcp-shared/schemas";
import z from "zod";

// export const getSalesHistory = tool({
//     description: "Property sales history",
//     inputSchema: z.object({
//         address: z.string(),
//         suburb: z.string(),
//         state: z.enum([
//             "NSW",
//             "VIC",
//             "QLD",
//             "WA",
//             "SA",
//             "TAS",
//             "NT",
//             "ACT",
//         ]),
//     }),
//     execute: async (p) =>
//         domainTools.getSalesHistory(
//             p.address,
//             p.suburb,
//             p.state as AustralianState,
//         ),
// });

// export const getSoldProperties = tool({
//     description: "Recently sold properties",
//     inputSchema: z.object({
//         suburb: z.string(),
//         state: z.enum([
//             "NSW",
//             "VIC",
//             "QLD",
//             "WA",
//             "SA",
//             "TAS",
//             "NT",
//             "ACT",
//         ]),
//         postcode: z.string().optional(),
//     }),
//     execute: async (p) =>
//         realestateTools.getSoldProperties(
//             p.suburb,
//             p.state as AustralianState,
//             p.postcode,
//         ),
// });

// export const getAuctionResults = tool({
//     description: "Auction clearance results",
//     inputSchema: z.object({
//         suburb: z.string(),
//         state: z.enum([
//             "NSW",
//             "VIC",
//             "QLD",
//             "WA",
//             "SA",
//             "TAS",
//             "NT",
//             "ACT",
//         ]),
//     }),
//     execute: async (p) =>
//         domainTools.getAuctionResults(
//             p.suburb,
//             p.state as AustralianState,
//         ),
// });