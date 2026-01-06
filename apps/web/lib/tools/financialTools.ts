import { tool } from "ai";
import z from "zod";

export const calculateCashFlow = tool({
    description: "Rental cash flow analysis",
    inputSchema: z.object({
        purchasePrice: z.number(),
        weeklyRent: z.number(),
        deposit: z.number(),
        interestRate: z.number().default(6.5),
        managementFee: z.number().default(8),
        councilRates: z.number().optional(),
        insurance: z.number().optional(),
        bodyCorpFees: z.number().optional(),
    }),
    execute: async (p) => {
        if (p.deposit >= p.purchasePrice) {
            throw new Error("Deposit must be less than purchase price");
        }

        const loan = p.purchasePrice - p.deposit;
        const annualRent = p.weeklyRent * 52;
        const vacancy = annualRent * 0.04;
        const effectiveRent = annualRent - vacancy;

        const interest = loan * (p.interestRate / 100);
        const management = effectiveRent * (p.managementFee / 100);
        const council =
            p.councilRates ?? p.purchasePrice * 0.003;
        const insurance =
            p.insurance ?? p.purchasePrice * 0.002;
        const maintenance = p.purchasePrice * 0.01;

        const totalExpenses =
            interest +
            management +
            council +
            insurance +
            maintenance +
            (p.bodyCorpFees ?? 0);

        const cashFlow = effectiveRent - totalExpenses;

        return {
            annualCashFlow: Math.round(cashFlow),
            weeklyCashFlow: Math.round(cashFlow / 52),
            grossYield:
                Math.round(
                    ((annualRent / p.purchasePrice) * 100) * 100,
                ) / 100,
            netYield:
                Math.round(
                    ((cashFlow / p.purchasePrice) * 100) * 100,
                ) / 100,
        };
    },
});

export const calculateROI = tool({
    description: "ROI and equity projection",
    inputSchema: z.object({
        purchasePrice: z.number(),
        deposit: z.number(),
        annualCashFlow: z.number(),
        growthRate: z.number().default(4),
        timeframeYears: z.number().default(10),
    }),
    execute: async (p) => {
        const futureValue =
            p.purchasePrice *
            Math.pow(
                1 + p.growthRate / 100,
                p.timeframeYears,
            );

        const totalCashFlow =
            p.annualCashFlow * p.timeframeYears;

        const capitalGain =
            futureValue - p.purchasePrice;

        const sellingCosts = futureValue * 0.03;
        const cgt =
            capitalGain * 0.5 * 0.37;

        const netProfit =
            capitalGain +
            totalCashFlow -
            sellingCosts -
            cgt;

        return {
            futureValue: Math.round(futureValue),
            capitalGain: Math.round(capitalGain),
            netProfit: Math.round(netProfit),
            annualizedROI:
                Math.round(
                    ((Math.pow(
                        (p.deposit + netProfit) / p.deposit,
                        1 / p.timeframeYears,
                    ) -
                        1) *
                        100) *
                    100,
                ) / 100,
        };
    },
})