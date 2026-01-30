import { tool } from "ai";
import z from "zod";
import { client } from "@propure/convex/client";
import { Doc, Id } from "@propure/convex/dataModel";
import { api } from "@propure/convex/api";

type SaveStrategyProps = {
    user: Doc<"users">;
    strategyId: Id<"strategies"> | null;
};

export const saveStrategy = ({ user, strategyId }: SaveStrategyProps) =>
    tool({
        description: "Create or update strategy",
        inputSchema: z.object({
            type: z.enum([
                "CASH_FLOW",
                "CAPITAL_GROWTH",
                "RENOVATION_FLIP",
                "DEVELOPMENT",
                "SMSF",
                "COMMERCIAL",
            ]),
            budget: z.number().optional(),
            deposit: z.number().optional(),
            income: z.number().optional(),
            riskTolerance: z.enum(["low", "medium", "high"]).optional(),
            timeline: z.enum(["short", "medium", "long"]).optional(),
            managementStyle: z.enum(["hands-on", "passive", "mixed"]).optional(),
        }),
        execute: async (params) => {
            try {
                const id = await client.mutation(
                    api.functions.strategy.CreateUpdateStrategy,
                    {
                        strategyId: strategyId ?? undefined,
                        userId: user._id,
                        status: "ACTIVE",
                        ...params,
                    },
                );

                return { strategyId: id };
            } catch (error) {
                throw new Error(`Failed to save strategy: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        },
    });

export const getStrategyTool = ({ userId }: { userId: Id<"users"> }) =>
    tool({
        description: "Get user's existing strategies",
        inputSchema: z.object({}),
        execute: async () => {
            try {
                const strategy = await client.query(
                    api.functions.strategy.GetStrategyByUserId,
                    { userId },
                );
                return strategy;
            } catch (error) {
                throw new Error(`Failed to get strategy: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        },
    });