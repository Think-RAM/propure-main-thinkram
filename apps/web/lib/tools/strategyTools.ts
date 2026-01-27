// import { Strategy, User } from "@prisma/client";
import { tool } from "ai";
import z from "zod";
import { prisma } from "@propure/db";
import { client } from "@propure/convex/client";
import { api, Doc, Id } from "@propure/convex/_generated";

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
      // const strategy = await prisma.strategy.upsert({
      //     where: { id: strategyId ?? "new" },
      //     update: {
      //         ...params,
      //         status: "ACTIVE",
      //         updatedAt: new Date(),
      //     },
      //     create: {
      //         userId: user.id,
      //         ...params,
      //         status: "ACTIVE",
      //     },
      // });
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
    },
  });
