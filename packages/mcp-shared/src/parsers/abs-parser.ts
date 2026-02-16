import { load, type Cheerio, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import type { MarketData } from "../schemas";

interface TableHeader {
  title: string;
  subtitle?: string;
}

interface TableRow {
  label: string;
  count: number;
  percentage?: number;
}

interface ExtractRowOptions {
  stripCurrency?: boolean;
  allowMissingPercentage?: boolean;
}

const PEOPLE_HEADER_TITLE = "People";
const PEOPLE_HEADER_SUBTITLE = "All people";

const MARITAL_STATUS_HEADER_TITLE = "Registered marital status";
const MARITAL_STATUS_HEADER_SUBTITLE = "People aged 15 years and over";

const EDUCATION_HEADER_TITLE = "Level of highest educational attainment";
const EDUCATION_HEADER_SUBTITLE = "People aged 15 years and over";

const LABOR_FORCE_HEADER_TITLE = "Participation in the labour force";
const LABOR_FORCE_HEADER_SUBTITLE = "People aged 15 years and over";

const EMPLOYMENT_STATUS_HEADER_TITLE = "Employment status";
const EMPLOYMENT_STATUS_HEADER_SUBTITLE =
  "People who reported being in the labour force, aged 15 years and over";

const OCCUPATION_HEADER_TITLE = "Occupation, top responses";
const OCCUPATION_HEADER_SUBTITLE = "Employed people aged 15 years and over";

const INDUSTRY_HEADER_TITLE = "Industry of employment, top responses";
const INDUSTRY_HEADER_SUBTITLE = "Employed people aged 15 years and over";

const MEDIAN_WEEKLY_INCOME_HEADER_TITLE = "Median weekly incomes (a)";
const MEDIAN_WEEKLY_INCOME_HEADER_SUBTITLE = "People aged 15 years and over";

const METHOD_OF_TRAVEL_HEADER_TITLE =
  "Method of travel to work on the day of the Census, top responses";
const METHOD_OF_TRAVEL_HEADER_SUBTITLE =
  "Employed people aged 15 years and over";

const FAMILY_COMPOSITION_HEADER_TITLE = "Family composition";
const FAMILY_COMPOSITION_HEADER_SUBTITLE = "All families";

const DWELLING_STRUCTURE_HEADER_TITLE = "Dwelling structure";
const DWELLING_STRUCTURE_HEADER_SUBTITLE =
  "Occupied private dwellings (excl. visitor only and other non-classifiable households)";

const NUMBER_OF_BEDROOMS_HEADER_TITLE = "Number of bedrooms";
const NUMBER_OF_BEDROOMS_HEADER_SUBTITLE =
  "Occupied private dwellings (excl. visitor only and other non-classifiable households)";

const TENURE_TYPE_HEADER_TITLE = "Tenure type";
const TENURE_TYPE_HEADER_SUBTITLE =
  "Occupied private dwellings (excl. visitor only and other non-classifiable households)";

const RENT_WEEKLY_PAYMENTS_HEADER_TITLE = "Rent weekly payments";
const RENT_WEEKLY_PAYMENTS_HEADER_SUBTITLE =
  "Occupied private dwellings (excl. visitor only and other non-classifiable households) being rented";

const MORTGAGE_MONTHLY_REPAYMENTS_HEADER_TITLE = "Mortgage monthly repayments";
const MORTGAGE_MONTHLY_REPAYMENTS_HEADER_SUBTITLE =
  "Occupied private dwellings (excl. visitor only and other non-classifiable households) owned with a mortgage or purchased under a shared equity scheme";

/**
 * Parse ABS "People" demographic table into a structured MarketData object.
 */
export function parseAbsMarketData(html: string): MarketData | null {
  const $ = load(html);
  const peopleRows = getBreakdownRows($, {
    title: PEOPLE_HEADER_TITLE,
    subtitle: PEOPLE_HEADER_SUBTITLE,
  });
  const maritalRows = getBreakdownRows($, {
    title: MARITAL_STATUS_HEADER_TITLE,
    subtitle: MARITAL_STATUS_HEADER_SUBTITLE,
  });
  const educationRows = getBreakdownRows($, {
    title: EDUCATION_HEADER_TITLE,
    subtitle: EDUCATION_HEADER_SUBTITLE,
  });
  const laborRows = getBreakdownRows($, {
    title: LABOR_FORCE_HEADER_TITLE,
    subtitle: LABOR_FORCE_HEADER_SUBTITLE,
  });
  const employmentRows = getBreakdownRows($, {
    title: EMPLOYMENT_STATUS_HEADER_TITLE,
    subtitle: EMPLOYMENT_STATUS_HEADER_SUBTITLE,
  });
  const occupationRows = getBreakdownRows($, {
    title: OCCUPATION_HEADER_TITLE,
    subtitle: OCCUPATION_HEADER_SUBTITLE,
  });
  const industryRows = getBreakdownRows($, {
    title: INDUSTRY_HEADER_TITLE,
    subtitle: INDUSTRY_HEADER_SUBTITLE,
  });
  const medianIncomeRows = getBreakdownRows(
    $,
    {
      title: MEDIAN_WEEKLY_INCOME_HEADER_TITLE,
      subtitle: MEDIAN_WEEKLY_INCOME_HEADER_SUBTITLE,
    },
    { stripCurrency: true },
  );
  const methodOfTravelRows = getBreakdownRows($, {
    title: METHOD_OF_TRAVEL_HEADER_TITLE,
    subtitle: METHOD_OF_TRAVEL_HEADER_SUBTITLE,
  });
  const familyCompositionRows = getBreakdownRows($, {
    title: FAMILY_COMPOSITION_HEADER_TITLE,
    subtitle: FAMILY_COMPOSITION_HEADER_SUBTITLE,
  });
  const dwellingStructureRows = getBreakdownRows($, {
    title: DWELLING_STRUCTURE_HEADER_TITLE,
    subtitle: DWELLING_STRUCTURE_HEADER_SUBTITLE,
  });
  const numberOfBedroomsRows = getBreakdownRows($, {
    title: NUMBER_OF_BEDROOMS_HEADER_TITLE,
    subtitle: NUMBER_OF_BEDROOMS_HEADER_SUBTITLE,
  });
  const tenureTypeRows = getBreakdownRows($, {
    title: TENURE_TYPE_HEADER_TITLE,
    subtitle: TENURE_TYPE_HEADER_SUBTITLE,
  });
  const rentWeeklyPaymentRows = getBreakdownRows(
    $,
    {
      title: RENT_WEEKLY_PAYMENTS_HEADER_TITLE,
      subtitle: RENT_WEEKLY_PAYMENTS_HEADER_SUBTITLE,
    },
    { stripCurrency: true },
  );
  const mortgageMonthlyRepaymentRows = getBreakdownRows(
    $,
    {
      title: MORTGAGE_MONTHLY_REPAYMENTS_HEADER_TITLE,
      subtitle: MORTGAGE_MONTHLY_REPAYMENTS_HEADER_SUBTITLE,
    },
    { stripCurrency: true },
  );

  if (!peopleRows) {
    return null;
  }

  // Extract summary container numeric values
  const summary = load(html)("#summary-container");
  const dwellingTable = summary.find("table.summaryTable.qsDwelling");
  const peopleTable = summary.find("table.summaryTable.qsPeople");
  const familiesTable = summary.find("table.summaryTable.qsFamilies");

  function parseCellNumber(text: string): number | null {
    if (!text) return null;
    const cleaned = text.replace(/[^0-9.\-]/g, "").trim();
    if (!cleaned) return null;
    const n = Number.parseFloat(cleaned.replace(/,/g, ""));
    return Number.isNaN(n) ? null : n;
  }

  // helper to find row by header text inside a table
  function findRowValue(
    $table: Cheerio<Element>,
    headerRegex: RegExp,
  ): string | null {
    const rows = ($table as any).find("tr").toArray();
    for (const r of rows) {
      const $r = load(r);
      const th = $r("th").first();
      const label = th.text() ? th.text().trim().replace(/\s+/g, " ") : "";
      if (headerRegex.test(label)) {
        const td = $r("td").first();
        return td.text().trim();
      }
    }
    return null;
  }
  const rented =
    tenureTypeRows?.find((r) => r.label.includes("Rented (b)"))?.count ?? 0;

  const ownerOccupied =
    (dwellingStructureRows?.reduce((sum, r) => sum + (r.count ?? 0), 0) ?? 0) -
    rented;

  return {
    census_year: 0,
    rented,
    ownerOccupied: ownerOccupied > 0 ? ownerOccupied : 0,
    people: peopleRows,
    maritalStatus: maritalRows ?? [],
    education: educationRows ?? [],
    laborForce: laborRows ?? [],
    employmentStatus: employmentRows ?? [],
    occupationTopResponses: occupationRows ?? [],
    industryTopResponses: industryRows ?? [],
    medianWeeklyIncomes: medianIncomeRows ?? [],
    methodOfTravelToWork: methodOfTravelRows ?? [],
    familyComposition: familyCompositionRows ?? [],
    dwellingStructure: dwellingStructureRows ?? [],
    numberOfBedrooms: numberOfBedroomsRows ?? [],
    tenureType: tenureTypeRows ?? [],
    rentWeeklyPayments: rentWeeklyPaymentRows ?? [],
    mortgageMonthlyRepayments: mortgageMonthlyRepaymentRows ?? [],
    // summary numeric fields
    totalPopulation:
      parseCellNumber(findRowValue(peopleTable, /People$/) ?? "") ?? undefined,
    medianAge:
      parseCellNumber(findRowValue(peopleTable, /Median age/i) ?? "") ??
      undefined,
    populationGrowth: undefined, // not available in summary
    malePercentage:
      parseCellNumber(
        findRowValue(peopleTable, /Male/i)?.replace("%", "") ?? "",
      ) ?? undefined,
    femalePercentage:
      parseCellNumber(
        findRowValue(peopleTable, /Female/i)?.replace("%", "") ?? "",
      ) ?? undefined,

    medianWeeklyPersonalIncome: undefined, // not present in sample
    medianWeeklyHouseholdIncome:
      parseCellNumber(
        findRowValue(dwellingTable, /Median weekly household income/i) ?? "",
      ) ?? undefined,
    medianWeeklyFamilyIncome: undefined, // not present in sample
    medianMonthlyMortgageRepayment:
      parseCellNumber(
        findRowValue(dwellingTable, /Median monthly mortgage repayments/i) ??
          "",
      ) ?? undefined,
    medianWeeklyRent:
      parseCellNumber(
        findRowValue(dwellingTable, /Median weekly rent/i) ?? "",
      ) ?? undefined,
  };
}

interface TableQuery {
  title: string;
  subtitle?: string;
}

function findTableByHeader($: CheerioAPI, query: TableQuery): Element | null {
  const tables = $("table").toArray();

  for (const table of tables) {
    const header = extractHeader($, table);
    if (!header) {
      continue;
    }

    if (header.title !== query.title) {
      continue;
    }

    if (query.subtitle && header.subtitle !== query.subtitle) {
      continue;
    }

    return table;
  }

  return null;
}

function extractHeader($: CheerioAPI, table: Element): TableHeader | null {
  const firstHeaderCell = $(table).find("th.firstCol").first();
  if (firstHeaderCell.length === 0) {
    return null;
  }

  const title = normalizeWhitespace(
    firstHeaderCell.clone().children().remove().end().text(),
  );
  const subtitle = normalizeWhitespace(firstHeaderCell.find("span em").text());

  if (!title) {
    return null;
  }

  return { title, subtitle: subtitle || undefined };
}

function getBreakdownRows(
  $: CheerioAPI,
  query: TableQuery,
  options?: ExtractRowOptions,
): TableRow[] | null {
  const table = findTableByHeader($, query);
  if (!table) {
    return null;
  }

  return extractTableRows($, table, options);
}

function extractTableRows(
  $: CheerioAPI,
  table: Element,
  options?: ExtractRowOptions,
): TableRow[] | null {
  const rows: TableRow[] = [];
  const mergedOptions: ExtractRowOptions = {
    allowMissingPercentage: true,
    ...options,
  };

  const elements = $(table).find("tr").toArray();

  for (const element of elements) {
    const parsedRow = extractRow($, $(element), mergedOptions);
    if (parsedRow) {
      rows.push(parsedRow);
    }
  }

  return rows.length ? rows : null;
}

function extractRow(
  $: CheerioAPI,
  row: Cheerio<Element>,
  options?: ExtractRowOptions,
): TableRow | null {
  const headerCell = row.find("th").first();
  const usesDataAsLabel = headerCell.length === 0;
  const fallbackLabelCell = row.find("td").first();
  const labelSource = usesDataAsLabel ? fallbackLabelCell : headerCell;

  if (!labelSource.length) {
    return null;
  }

  const label = normalizeWhitespace(labelSource.text());
  if (!label) {
    return null;
  }

  const cells = usesDataAsLabel ? row.find("td").slice(1) : row.find("td");
  if (cells.length === 0) {
    return null;
  }

  const countRaw = cells.eq(0).text();
  const countText = options?.stripCurrency
    ? normalizeWhitespace(countRaw).replace(/[^0-9.,-]/g, "")
    : cleanNumericText(countRaw);

  if (!countText) {
    return null;
  }

  const count = Number.parseFloat(countText.replace(/,/g, ""));
  if (Number.isNaN(count)) {
    return null;
  }

  const percentageCell = cells.eq(1);
  const percentageText =
    percentageCell.length > 0 ? cleanNumericText(percentageCell.text()) : "";
  const allowMissingPercentage = options?.allowMissingPercentage ?? false;
  if (!percentageText && !allowMissingPercentage) {
    return null;
  }

  const percentage = percentageText
    ? Number.parseFloat(percentageText)
    : undefined;
  if (percentage !== undefined && Number.isNaN(percentage)) {
    return null;
  }

  return {
    label,
    count,
    percentage,
  };
}

function cleanNumericText(value: string): string {
  return value.replace(/[^0-9.,-]/g, "").trim();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export interface AbsPopulationProjection {
  suburb?: string;
  state: string;
  year: number;
  projectedPopulation: number;
  growthRate: number; // percent, e.g. 1.5 === 1.5%
}

export function parseAbsPopulationProjections(
  html: string,
  // opts?: { state?: string; series?: string; suburb?: string },
): AbsPopulationProjection[] {
  const $ = load(html);
  const targetStates = [
    "New South Wales",
    "Victoria",
    "Queensland",
    "South Australia",
    "Western Australia",
    "Tasmania",
    "Northern Territory",
    "Australian Capital Territory",
  ];

  // const wantedState = opts?.state;
  const seriesName = "Medium series";
  // const suburb = opts?.suburb ?? "";

  const final: AbsPopulationProjection[] = [];

  // find all chart-table blocks and parse their table only
  const blocks = $(".abs-chart-table").toArray();
  // console.log(`Found ${blocks.length} .abs-chart-table blocks in the HTML`);
  // console.log($(blocks[0]).html());
  for (const b of blocks) {
    const block = $(b);

    // Find the table inside this block
    const table = block.find("table.responsive-enabled").first();
    if (!table.length) continue;

    // Extract caption text
    const title = normalizeWhitespace(table.find("caption").text() || "");

    // console.log("Found table with title:", title);
    if (!title) continue;

    // expect title like: "Projected population, New South Wales"
    const titleLower = title.toLowerCase();

    if (!titleLower.includes("projected population")) continue;

    const matchedState = targetStates.find((s) =>
      titleLower.includes(s.toLowerCase()),
    );
    if (!matchedState) continue;
    // if (wantedState && wantedState !== matchedState) continue;

    // find the table (table view)
    const results: {
      year: number;
      mediumSeries: number;
    }[] = [];

    // Select all table body rows
    let mediumColIndex = -1;

    table.find("thead th").each((index, th) => {
      const headerText = $(th).text().trim().toLowerCase();
      if (headerText === "medium series") {
        mediumColIndex = index;
      }
    });

    if (mediumColIndex === -1) {
      throw new Error("Medium series column not found");
    }

    // 2️⃣ Extract rows
    table.find("tbody tr").each((_, tr) => {
      const yearText = $(tr).find("th.row-header").text().trim();
      if (!yearText) return;

      const mediumText = $(tr)
        .find("td")
        .eq(mediumColIndex - 1) // subtract 1 because first column is <th>
        .text()
        .trim();

      if (!mediumText) return;

      results.push({
        year: Number(yearText),
        mediumSeries: Number(mediumText.replace(/,/g, "")),
      });
    });

    // compute growth rates and push
    let prev: number | null = null;
    for (let i = 0; i < results.length; i++) {
      const year = results[i].year;
      const value = results[i].mediumSeries;
      const growth = prev === null ? 0 : ((value - prev) / prev) * 100;
      final.push({
        // suburb,
        state: matchedState,
        year,
        projectedPopulation: value,
        growthRate: Number.isFinite(growth)
          ? Number(Number(growth.toFixed(6)))
          : 0,
      });
      prev = value;
    }
  }

  return final;
}
