import { Strategy, StrategyType, User } from "@prisma/client";
import { tool } from "ai";
import z from "zod";
import { prisma } from "@propure/db";

type SaveStrategyProps = {
    user: User & { strategies?: Strategy[] };
    strategyId: string | null;
};

export const saveStrategy = ({ user, strategyId }: SaveStrategyProps) => tool({
    description: "Create or update strategy",
    inputSchema: z.object({
        type: z.enum([
            StrategyType.CASH_FLOW,
            StrategyType.CAPITAL_GROWTH,
            StrategyType.RENOVATION_FLIP,
            StrategyType.DEVELOPMENT,
            StrategyType.SMSF,
            StrategyType.COMMERCIAL
        ]),
        budget: z.number().optional(),
        deposit: z.number().optional(),
        income: z.number().optional(),
        riskTolerance: z
            .enum(["low", "medium", "high"])
            .optional(),
        timeline: z
            .enum(["short", "medium", "long"])
            .optional(),
        managementStyle: z
            .enum(["hands-on", "passive", "mixed"])
            .optional(),
    }),
    execute: async (params) => {
        const strategy = await prisma.strategy.upsert({
            where: { id: strategyId ?? "new" },
            update: {
                ...params,
                status: "ACTIVE",
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                ...params,
                status: "ACTIVE",
            },
        });

        return { strategyId: strategy.id };
    },
});

interface GetStrategyInput {
    userId: string;
}

export const getStrategyTool = ({ userId }: GetStrategyInput) => {
    const toolInstance = tool({
        description: "Get investment strategy based on user prompt",
        inputSchema: z.object({
            type: z.enum([
                StrategyType.CASH_FLOW,
                StrategyType.CAPITAL_GROWTH,
                StrategyType.RENOVATION_FLIP,
                StrategyType.DEVELOPMENT,
                StrategyType.SMSF,
                StrategyType.COMMERCIAL
            ]).describe("User's investment preferences and goals"),
        }),
        execute: async ({ type }) => {
            const strategy = await prisma.strategy.findFirst({
                where: {
                    userId,
                    type,
                    status: "ACTIVE",
                }
            });
            
            return strategy;
        }
    })
    return toolInstance;
}