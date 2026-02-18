import { client } from "@propure/convex/client";
import { api } from "@propure/convex/genereated";
import type { Doc } from "@propure/convex/genereated";
import { addressToCoordinatesGoogle, calculateDemandInfrastructureScore, calculateSuburbCBDScore } from "../utils/map";

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

function getYear(record: Doc<"absMarketData">) {
    return record.scrapedAt
        ? new Date(record.scrapedAt).getFullYear()
        : null;
}


function groupByYear(sales: Doc<"properties">[]) {
    const grouped: Record<string, number[]> = {};

    for (const p of sales) {
        if (!p.soldPrice || !p.soldDate) continue;

        const year = new Date(p.soldDate).getFullYear();

        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(p.soldPrice);
    }

    return grouped;
}

function median(values: number[]) {
    if (!values.length) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}

function normalizeToScale(
    value: number,
    min: number,
    max: number,
    scaleMin = 1,
    scaleMax = 10
) {
    if (value == null) return null;

    const clamped = Math.min(Math.max(value, min), max);

    const normalized =
        ((clamped - min) / (max - min)) *
        (scaleMax - scaleMin) +
        scaleMin;

    return normalized;
}

function calculatePriceGrowth(sales: Doc<"properties">[]) {
    const grouped = groupByYear(sales);

    const years = Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b);

    if (years.length < 4) return null;

    const startYear = years[years.length - 4];
    const endYear = years[years.length - 1];
    const yearsDiff = endYear - startYear;

    const startMedian = median(grouped[startYear]);
    const endMedian = median(grouped[endYear]);

    if (!startMedian || !endMedian) return null;

    const cagr =
        Math.pow(endMedian / startMedian, 1 / yearsDiff) - 1;

    return cagr * 100; // %
}

function calculateIncomeGrowth(absData: Doc<"absMarketData">[]) {
    const sorted = absData
        .filter(d => d.medianWeeklyHouseholdIncome != null)
        .sort((a, b) => {
            const aYear = a.scrapedAt ? new Date(a.scrapedAt).getFullYear() : 0;
            const bYear = b.scrapedAt ? new Date(b.scrapedAt).getFullYear() : 0;
            return aYear - bYear;
        });

    if (sorted.length < 2) return null;

    const start = sorted[0].medianWeeklyHouseholdIncome!;
    const end = sorted[sorted.length - 1].medianWeeklyHouseholdIncome!;

    const years = new Date(sorted[sorted.length - 1].scrapedAt!).getFullYear() - new Date(sorted[0].scrapedAt!).getFullYear();
    if (years <= 0) return null;

    const cagr = Math.pow(end / start, 1 / years) - 1;

    return cagr * 100; // %
}

function calculateAffordabilityScore(
    typicalValue?: number,
    avgWeeklyIncome?: number
) {
    if (!typicalValue || !avgWeeklyIncome) return null;

    const annualIncome = avgWeeklyIncome * 52;
    const ratio = typicalValue / annualIncome;

    const minRatio = 3;
    const maxRatio = 15;

    const clamped = Math.min(Math.max(ratio, minRatio), maxRatio);

    const score =
        ((maxRatio - clamped) / (maxRatio - minRatio)) * 100;

    return Math.round(score);
}

function calculateProfessionalWorkforcePercentage(
    absData: Doc<"absMarketData">[]
) {
    if (!absData?.length) return null;

    const professionalLabels = [
        "Managers",
        "Professionals",
        "Technicians and Trades Workers"
    ];

    const employedLabels = [
        "Employed, worked full-time",
        "Employed, worked part-time",
        "Employed"
    ];

    // Group by year
    const grouped: Record<number, Doc<"absMarketData">[]> = {};

    for (const record of absData) {
        const year = getYear(record);
        if (!year) continue;

        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(record);
    }

    const yearlyPercentages: number[] = [];

    for (const year of Object.keys(grouped)) {
        const records = grouped[Number(year)];

        let totalEmployed = 0;
        let totalProfessionals = 0;

        for (const record of records) {
            // Sum employed
            totalEmployed +=
                record.employmentStatus
                    ?.filter(e => employedLabels.includes(e.label))
                    .reduce((sum, e) => sum + e.count, 0) ?? 0;

            // Sum professional occupations
            totalProfessionals +=
                record.occupationTopResponses
                    ?.filter(o => professionalLabels.includes(o.label))
                    .reduce((sum, o) => sum + o.count, 0) ?? 0;
        }

        if (totalEmployed > 0) {
            yearlyPercentages.push(
                (totalProfessionals / totalEmployed) * 100
            );
        }
    }

    if (!yearlyPercentages.length) return null;

    // Average across years
    const avg =
        yearlyPercentages.reduce((a, b) => a + b, 0) /
        yearlyPercentages.length;

    return avg;
}

function calculateRentalGrowthScore(rentalProperties: Doc<"properties">[]) {
    const grouped: Record<string, number[]> = {};

    for (const p of rentalProperties) {
        if (!p.price || !p.listedDate || !p.priceFrom || p.priceTo) continue;
        const year = new Date(p.listedDate).getFullYear();
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(getRentalPrice(p)!);
    }

    const yearlyGrowthRates: number[] = [];

    const years = Object.keys(grouped).map(Number);
    years.sort((a, b) => a - b);

    for (let i = 1; i < years.length; i++) {
        const prevYear = years[i - 1];
        const currYear = years[i];

        const prevPrices = grouped[prevYear];
        const currPrices = grouped[currYear];

        if (!prevPrices || !currPrices || prevPrices.length === 0 || currPrices.length === 0) continue;

        const prevAvgPrice = prevPrices.reduce((sum, p) => sum + p, 0) / prevPrices.length;
        const currAvgPrice = currPrices.reduce((sum, p) => sum + p, 0) / currPrices.length;

        if (prevAvgPrice > 0) {
            yearlyGrowthRates.push((currAvgPrice - prevAvgPrice) / prevAvgPrice * 100);
        }
    }

    if (yearlyGrowthRates.length === 0) return null;

    // Average across years
    const avgGrowthRate =
        yearlyGrowthRates.reduce((a, b) => a + b, 0) /
        yearlyGrowthRates.length;

    return normalizeToScale(avgGrowthRate, -5, 10);
}

function getYearlyMedianPrices(sales: Doc<"properties">[]) {
    const grouped: Record<number, number[]> = {};

    for (const p of sales) {
        if (!p.soldPrice || !p.soldDate) continue;

        const year = new Date(p.soldDate).getFullYear();
        if (!grouped[year]) grouped[year] = [];
        grouped[year].push(p.soldPrice);
    }

    const yearlyMedians: Record<number, number> = {};

    for (const year of Object.keys(grouped)) {
        const prices = grouped[Number(year)].sort((a, b) => a - b);
        const mid = Math.floor(prices.length / 2);

        yearlyMedians[Number(year)] =
            prices.length % 2 === 0
                ? (prices[mid - 1] + prices[mid]) / 2
                : prices[mid];
    }

    return yearlyMedians;
}

function getAnnualGrowthRates(yearlyMedians: Record<number, number>) {
    const years = Object.keys(yearlyMedians)
        .map(Number)
        .sort((a, b) => a - b);

    const growthRates: number[] = [];

    for (let i = 1; i < years.length; i++) {
        const prev = yearlyMedians[years[i - 1]];
        const current = yearlyMedians[years[i]];

        if (!prev || !current) continue;

        const growth = (current - prev) / prev;
        growthRates.push(growth);
    }

    return growthRates;
}

function calculateStdDev(values: number[]) {
    if (values.length < 2) return null;

    const mean =
        values.reduce((a, b) => a + b, 0) / values.length;

    const variance =
        values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
        (values.length - 1);

    return Math.sqrt(variance);
}

function calculatePriceVolatility(
    sales: Doc<"properties">[]
) {
    const yearlyMedians = getYearlyMedianPrices(sales);
    const growthRates = getAnnualGrowthRates(yearlyMedians);

    const stdDev = calculateStdDev(growthRates);

    return stdDev !== null ? stdDev * 100 : null; // return %
}

function calculateInterestRateSensitivity(
    absData: Doc<"absMarketData">[],
    typicalValue: number
) {
    if (!absData?.length) return null;

    const latest = absData[absData.length - 1];

    const weeklyIncome = latest.medianWeeklyHouseholdIncome;
    const monthlyMortgage = latest.medianMonthlyMortgageRepayment;

    if (!weeklyIncome || !monthlyMortgage || !typicalValue)
        return null;

    const monthlyIncome = (weeklyIncome * 52) / 12;

    const mortgageBurden = monthlyMortgage / monthlyIncome; // ratio

    const priceToIncome =
        typicalValue / (weeklyIncome * 52);

    // Mortgage ownership ratio
    const mortgagedOwners =
        latest.tenureType
            ?.find(t =>
                t.label.toLowerCase().includes("mortgage")
            )?.count ?? 0;

    const totalTenure =
        (latest.ownerOccupied ?? 0) +
        (latest.rented ?? 0);

    const mortgageRatio =
        totalTenure > 0
            ? mortgagedOwners / totalTenure
            : 0;

    // Normalize each risk component (example ranges)
    const burdenScore =
        normalizeToScale(mortgageBurden, 0.15, 0.45, 0, 100)!;

    const priceIncomeScore =
        normalizeToScale(priceToIncome, 4, 12, 0, 100)!;

    const leverageScore =
        normalizeToScale(mortgageRatio, 0.2, 0.6, 0, 100)!;

    // Composite (higher = more sensitive)
    const sensitivity =
        burdenScore * 0.4 +
        priceIncomeScore * 0.35 +
        leverageScore * 0.25;

    return Math.round(sensitivity);
}

function calculateLiquidityRisk({
    annualSales,
    totalDwellings,
    averageDaysOnMarket,
    stockOnMarketPct,
    auctionClearanceRate,
}: {
    annualSales: number;
    totalDwellings: number;
    averageDaysOnMarket: number;
    stockOnMarketPct: number;
    auctionClearanceRate: number;
}) {
    if (!totalDwellings || !annualSales) return null;

    const turnoverRate = annualSales / totalDwellings;

    const turnoverScore = normalizeInverse(
        turnoverRate,
        0.02, // 2% very low
        0.08  // 8% healthy
    )!;

    const domScore = normalizeToScale(
        averageDaysOnMarket,
        20,
        120,
        0,
        100
    )!;

    const stockScore = normalizeToScale(
        stockOnMarketPct,
        1,
        8,
        0,
        100
    )!;

    const auctionScore = normalizeInverse(
        auctionClearanceRate,
        50,
        85
    )!;

    const liquidityRisk =
        turnoverScore * 0.35 +
        domScore * 0.25 +
        stockScore * 0.20 +
        auctionScore * 0.20;

    return Math.round(liquidityRisk);
}

function calculateHHI(distribution: { count: number }[]) {
    const total = distribution.reduce((a, b) => a + b.count, 0);
    if (!total) return null;

    let hhi = 0;

    for (const item of distribution) {
        const share = item.count / total;
        hhi += share * share;
    }

    return hhi;
}

function calculateConcentrationRisk(absData: Doc<"absMarketData">) {
    const industryHHI = calculateHHI(
        absData.industryTopResponses ?? []
    );

    const dwellingHHI = calculateHHI(
        absData.dwellingStructure ?? []
    );

    const renterShare =
        absData.rented && absData.ownerOccupied
            ? absData.rented /
            (absData.rented + absData.ownerOccupied)
            : null;

    const renterScore =
        renterShare !== null
            ? normalizeToScale(renterShare, 0.2, 0.7, 0, 100)
            : 0;

    const concentrationRisk =
        (industryHHI ?? 0) * 100 * 0.5 +
        (dwellingHHI ?? 0) * 100 * 0.3 +
        (renterScore ?? 0) * 0.2;

    return Math.round(concentrationRisk);
}


const normalizeInverse = (
    value: number,
    min: number,
    max: number,
    scaleMin = 0,
    scaleMax = 100
) => {
    if (value == null) return null;
    const clamped = Math.min(Math.max(value, min), max);
    const normalized =
        ((max - clamped) / (max - min)) *
        (scaleMax - scaleMin) +
        scaleMin;
    return normalized;
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


async function fetchAllSalePropertiesForSuburb(
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
                    listingType: "sale",
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
    suburb: string, // format "Suburb, VIC, 1234"
    saleProperties: Doc<"properties">[],
    soldProperties: Doc<"properties">[],
    renterProperties: Doc<"properties">[],
    absData: Doc<"absMarketData">[]
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
    const soldPropertiesSafe = soldProperties
        .filter((p) => typeof p.soldPrice === "number")
        .sort((a, b) => b.soldPrice! - a.soldPrice!);

    const soldPrices = soldPropertiesSafe.map((p) => p.soldPrice!);

    const typicalValue = safeAverage(soldPrices);

    const medianValue =
        soldPrices.length === 0
            ? null
            : soldPrices.length % 2 === 0
                ? (soldPrices[soldPrices.length / 2 - 1] +
                    soldPrices[soldPrices.length / 2]) /
                2
                : soldPrices[Math.floor(soldPrices.length / 2)];

    const daysOnMarketValues = soldPropertiesSafe
        .map((p) => Number(p.daysOnMarket))
        .filter(Number.isFinite);

    const averageDaysOnMarket = safeAverage(daysOnMarketValues);

    const auctionClearanceRate = safePercent(
        soldPropertiesSafe.filter((p) => p.soldAt === "AUCTION").length,
        soldPropertiesSafe.length
    );

    // ---------- ABS / TENURE ----------
    const avgRenters = absData.reduce((sum, d) => sum + (d.rented ?? 0), 0);
    const avgOwners = absData.reduce((sum, d) => sum + (d.ownerOccupied ?? 0), 0);

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
    const numberOfPropertiesOnMarket = saleProperties.length ;

    const stockOnMarket =
        totalTenure !== null
            ? safePercent(numberOfPropertiesOnMarket, totalTenure)
            : null;

    // ---------- DATA COMPLETENESS ----------
    const salesCount = soldPropertiesSafe.length;
    const rentalCount = renterProperties.length;

    const salesVolumeScore = ratioScore(
        salesCount,
        THRESHOLDS.idealSales
    );

    const salesFieldCompleteness =
        soldPropertiesSafe.reduce((sum, p) => {
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

    // ---------- Growth Score Calculation ----------

    // Guard ABS data
    const avgPopulation = safeAverage(
        absData.map(d => d.totalPopulation ?? 0).filter(v => v > 0)
    );

    const priceGrowth = calculatePriceGrowth(saleProperties);
    const priceGrowthScore =
        priceGrowth !== null
            ? normalizeToScale(priceGrowth, -5, 15)
            : null;

    const incomeGrowth = calculateIncomeGrowth(absData);
    const incomeGrowthScore =
        incomeGrowth !== null
            ? normalizeToScale(incomeGrowth, 0, 10)
            : null;

    const infrastructurePipelineScore =
        avgPopulation && avgPopulation > 0
            ? await calculateDemandInfrastructureScore(suburb, avgPopulation)
            : null;

    const suburbEmploymentPercentage =
        calculateProfessionalWorkforcePercentage(absData);

    const employmentScore =
        suburbEmploymentPercentage !== null
            ? normalizeToScale(suburbEmploymentPercentage, 20, 60)
            : null;

    // Safe state extraction
    const suburbParts = suburb.split(",");
    const state =
        suburbParts.length > 1
            ? suburbParts[1].trim()
            : null;

    const cbdProximityResult =
        state
            ? await calculateSuburbCBDScore(suburb, state as any)
            : null;

    const cbdProximityScore = cbdProximityResult ?? null;

    const avgWeeklyIncome = safeAverage(
        absData
            .map(d => d.medianWeeklyHouseholdIncome ?? 0)
            .filter(v => v > 0)
    );

    const avgAnnualIncome =
        avgWeeklyIncome ? avgWeeklyIncome * 52 : null;

    const affordabilityResult =
        typicalValue && avgAnnualIncome
            ? calculateAffordabilityScore(
                typicalValue,
                avgWeeklyIncome!
            )
            : null;

    const affordabilityScore = affordabilityResult ?? null;

    const auctionScore =
        auctionClearanceRate !== null
            ? normalizeToScale(auctionClearanceRate, 50, 90)
            : null;


    const capitalGrowthComponent = [
        { score: priceGrowthScore, weight: 0.25 },
        { score: incomeGrowthScore, weight: 0.20 },
        { score: infrastructurePipelineScore, weight: 0.15 },
        { score: employmentScore, weight: 0.15 },
        { score: cbdProximityScore, weight: 0.10 },
        { score: auctionScore, weight: 0.10 },
        { score: affordabilityScore, weight: 0.05 },
    ];

    // Only include valid scores
    const validComponents = capitalGrowthComponent.filter(
        c => typeof c.score === "number" && !isNaN(c.score)
    );

    const totalWeight = validComponents.reduce(
        (sum, c) => sum + c.weight,
        0
    );

    const capitalGrowthScoreRaw =
        totalWeight > 0
            ? validComponents.reduce(
                (sum, c) => sum + (c.score! * c.weight),
                0
            ) / totalWeight
            : null;

    const capitalGrowthScore = capitalGrowthScoreRaw !== null ? Math.round(clamp(capitalGrowthScoreRaw, 0, 100)) : null;

    // ---------- Cash Flow Score Calculation ----------
    const grossYeildScore = netYield !== null
        ? normalizeToScale(netYield, 0, 10)
        : null;
    const vacancyScore = vacancyRate !== null
        ? normalizeToScale(vacancyRate, 0, 10)
        : null;
    const rentalGrowthScore = calculateRentalGrowthScore(renterProperties);
    const daysOnMarketScore = averageDaysOnMarket !== null
        ? normalizeToScale(averageDaysOnMarket, 90, 0)
        : null;
    const stockOnMarketScore = stockOnMarket !== null
        ? normalizeToScale(stockOnMarket, 0, 0.05)
        : null;

    const cashFlowComponent = [
        { score: grossYeildScore, weight: 0.30 },
        { score: vacancyScore, weight: 0.25 },
        { score: rentalGrowthScore, weight: 0.15 },
        { score: daysOnMarketScore, weight: 0.10 },
        { score: stockOnMarketScore, weight: 0.10 },
        { score: affordabilityScore, weight: 0.10 },
    ];

    const validCashFlowComponents = cashFlowComponent.filter(
        c => typeof c.score === "number" && !isNaN(c.score)
    );

    const totalCashFlowWeight = validCashFlowComponents.reduce(
        (sum, c) => sum + c.weight,
        0
    );

    const cashFlowScoreRaw =
        totalCashFlowWeight > 0
            ? validCashFlowComponents.reduce(
                (sum, c) => sum + (c.score! * c.weight),
                0
            ) / totalCashFlowWeight
            : null;

    const cashFlowScore = cashFlowScoreRaw !== null ? Math.round(clamp(cashFlowScoreRaw, 0, 100)) : null;

    // ---------- RISK SCORE CALCULATION ----------
    let risk = {
        marketRisk: 0,
        financialRisk: 0,
        liquidityRisk: 0,
        concentrationRisk: 0,
    };
    if (vacancyRate && vacancyRate > 5) risk.marketRisk += 40;
    else if (vacancyRate && vacancyRate > 3) risk.marketRisk += 25;
    else if (vacancyRate && vacancyRate > 2) risk.marketRisk += 15;
    else risk.marketRisk += 5;

    if (averageDaysOnMarket && averageDaysOnMarket > 90) risk.marketRisk += 30;
    else if (averageDaysOnMarket && averageDaysOnMarket > 60) risk.marketRisk += 20;
    else if (averageDaysOnMarket && averageDaysOnMarket > 30) risk.marketRisk += 10;
    else risk.marketRisk += 5;

    const priceVolatility = calculatePriceVolatility(saleProperties);
    const volatilityScore = priceVolatility !== null ? normalizeToScale(priceVolatility, 0, 0.15) : null;
    risk.marketRisk += volatilityScore !== null ? (volatilityScore / 100) * 30 : 0;

    const avgMonthlyMortgage = absData.reduce((sum, d) => sum + (d.medianMonthlyMortgageRepayment ?? 0), 0) / absData.filter(d => d.medianMonthlyMortgageRepayment != null).length;
    const loanToValueRatio = typicalValue && avgMonthlyMortgage ? (avgMonthlyMortgage * 12) / typicalValue : null;
    if (loanToValueRatio && loanToValueRatio > 0.9) risk.financialRisk += 40;
    else if (loanToValueRatio && loanToValueRatio > 0.8) risk.financialRisk += 25;
    else if (loanToValueRatio && loanToValueRatio > 0.7) risk.financialRisk += 15;
    else risk.financialRisk += 5;

    // Cash flow component (0-30 points)
    const cashFlowStatus = cashFlowScore !== null
        ? cashFlowScore > 70
            ? "positive"
            : cashFlowScore > 40
                ? "neutral"
                : "negative"
        : null;
    if (cashFlowStatus === 'negative') risk.financialRisk += 30;
    else if (cashFlowStatus === 'neutral') risk.financialRisk += 15;
    else risk.financialRisk += 5;

    // Interest rate sensitivity (0-30 points)
    const interestRateSensitivity = calculateInterestRateSensitivity(absData, typicalValue!);
    risk.financialRisk += interestRateSensitivity !== null ? (interestRateSensitivity * 30) / 100 : 0;

    risk.liquidityRisk = calculateLiquidityRisk({
        annualSales: soldPropertiesSafe.length,
        totalDwellings: totalTenure ?? 0,
        averageDaysOnMarket: averageDaysOnMarket ?? 0,
        stockOnMarketPct: stockOnMarket ?? 0,
        auctionClearanceRate: auctionClearanceRate ?? 0,
    }) ?? 0;

    const latestAbsData = absData.reduce<Doc<"absMarketData"> | null>(
        (latest, current) => {
            if (!latest) return current;
            return current.scrapedAt > latest.scrapedAt
                ? current
                : latest;
        },
        null
    )!;
    risk.concentrationRisk = calculateConcentrationRisk(latestAbsData) ?? 0;

    const riskComponents = [
        { score: risk.marketRisk, weight: 0.4 },
        { score: risk.financialRisk, weight: 0.3 },
        { score: risk.liquidityRisk, weight: 0.2 },
        { score: risk.concentrationRisk, weight: 0.10 },
    ];
    const totalRiskWeight = riskComponents.reduce(
        (sum, c) => sum + c.weight,
        0
    );
    const riskScoreRaw =
        totalRiskWeight > 0
            ? riskComponents.reduce(
                (sum, c) => sum + (c.score * c.weight),
                0
            ) / totalRiskWeight
            : null;
    const riskScore = riskScoreRaw !== null ? Math.round(clamp(riskScoreRaw, 0, 100)) : null;

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
        capitalGrowthScore,
        cashFlowScore,
        riskScore,
        risk,
        dataCompletenessScore,
    };
}

async function updateSuburbMetricsInDb(metrics: Awaited<ReturnType<typeof calculateSuburbMetrics>>, suburb: string, postcode: string) {
    "use step";
    try {
        const geometry = await addressToCoordinatesGoogle(`${suburb} VIC ${postcode}`);
        if (!geometry) {
            throw new Error("Failed to geocode suburb location");
        }
        await client.mutation(api.functions.suburbMetrics.upsertSuburbMetricsData, {
            postcode,
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
                capitalGrowthScore: metrics.capitalGrowthScore ?? 0,
                riskScore: metrics.riskScore ?? 0,
                cashFlowScore: metrics.cashFlowScore ?? 0,
                risk: metrics.risk ?? { marketRisk: 0, financialRisk: 0 },
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
            const [soldProperties, renterProperties, saleProperties, absData] =
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
                    fetchAllSalePropertiesForSuburb(
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
                `${loc.suburb}, ${loc.state}, ${loc.postcode}`,
                saleProperties,
                soldProperties,
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