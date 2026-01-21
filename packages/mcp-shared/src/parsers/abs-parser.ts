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
  percentage: number | null;
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
const OCCUPATION_HEADER_SUBTITLE =
  "Employed people aged 15 years and over";

const INDUSTRY_HEADER_TITLE = "Industry of employment, top responses";
const INDUSTRY_HEADER_SUBTITLE =
  "Employed people aged 15 years and over";

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
  const peopleTable = findTableByHeader($, {
    title: PEOPLE_HEADER_TITLE,
    subtitle: PEOPLE_HEADER_SUBTITLE,
    requiredRows: ["Male", "Female"],
  });

  const maritalTable = findTableByHeader($, {
    title: MARITAL_STATUS_HEADER_TITLE,
    subtitle: MARITAL_STATUS_HEADER_SUBTITLE,
    requiredRows: [
      "Married",
      "Separated",
      "Divorced",
      "Widowed",
      "Never married",
    ],
  });

  if (!peopleTable || !maritalTable) {
    return null;
  }

  const peopleRows = parsePeopleRows($, peopleTable);
  const maritalRows = parseMaritalRows($, maritalTable);

  const educationTable = findTableByHeader($, {
    title: EDUCATION_HEADER_TITLE,
    subtitle: EDUCATION_HEADER_SUBTITLE,
    requiredRows: [
      "Bachelor Degree level and above",
      "Advanced Diploma and Diploma level",
      "Certificate level IV",
      "Certificate level III",
      "Year 12",
      "Year 11",
      "Year 10",
      "Certificate level II",
      "Certificate level I",
      "Year 9 or below",
      "Inadequately described",
      "No educational attainment",
      "Not stated",
    ],
  });

  if (!educationTable) {
    return null;
  }

  const educationRows = parseEducationRows($, educationTable);
  const laborTable = findTableByHeader($, {
    title: LABOR_FORCE_HEADER_TITLE,
    subtitle: LABOR_FORCE_HEADER_SUBTITLE,
    requiredRows: [
      "In the labour force",
      "Not in the labour force",
      "Not stated",
    ],
  });

  if (!laborTable) {
    return null;
  }

  const laborRows = parseLaborForceRows($, laborTable);

  const employmentTable = findTableByHeader($, {
    title: EMPLOYMENT_STATUS_HEADER_TITLE,
    subtitle: EMPLOYMENT_STATUS_HEADER_SUBTITLE,
    requiredRows: [
      "Worked full-time",
      "Worked part-time",
      "Away from work (a)",
      "Unemployed",
    ],
  });

  if (!employmentTable) {
    return null;
  }

  const occupationTable = findTableByHeader($, {
    title: OCCUPATION_HEADER_TITLE,
    subtitle: OCCUPATION_HEADER_SUBTITLE,
    requiredRows: [
      "Professionals",
      "Managers",
      "Community and Personal Service Workers",
      "Technicians and Trades Workers",
      "Clerical and Administrative Workers",
      "Labourers",
      "Sales Workers",
      "Machinery Operators and Drivers",
    ],
  });

  if (!occupationTable) {
    return null;
  }

  const industryTable = findTableByHeader($, {
    title: INDUSTRY_HEADER_TITLE,
    subtitle: INDUSTRY_HEADER_SUBTITLE,
    requiredRows: [
      "Cafes and Restaurants",
      "Computer System Design and Related Services",
      "Banking",
      "Other Auxiliary Finance and Investment Services",
      "Building and Other Industrial Cleaning Services",
    ],
  });

  if (!industryTable) {
    return null;
  }

  const medianIncomeTable = findTableByHeader($, {
    title: MEDIAN_WEEKLY_INCOME_HEADER_TITLE,
    subtitle: MEDIAN_WEEKLY_INCOME_HEADER_SUBTITLE,
    requiredRows: ["Personal (b)", "Family (c)", "Household (d)"],
  });

  if (!medianIncomeTable) {
    return null;
  }

  const methodOfTravelTable = findTableByHeader($, {
    title: METHOD_OF_TRAVEL_HEADER_TITLE,
    subtitle: METHOD_OF_TRAVEL_HEADER_SUBTITLE,
    requiredRows: [
      "Walked only",
      "Car, as driver",
      "Train",
      "Bus",
      "Train, bus",
      "Did not go to work",
      "Worked at home",
      "People who travelled to work by public transport (a)",
      "People who travelled to work by car as driver or passenger (b)",
    ],
  });

  if (!methodOfTravelTable) {
    return null;
  }

  const familyCompositionTable = findTableByHeader($, {
    title: FAMILY_COMPOSITION_HEADER_TITLE,
    subtitle: FAMILY_COMPOSITION_HEADER_SUBTITLE,
    requiredRows: [
      "Couple family without children",
      "Couple family with children",
      "One parent family",
      "Other family",
    ],
  });

  if (!familyCompositionTable) {
    return null;
  }

  const dwellingStructureTable = findTableByHeader($, {
    title: DWELLING_STRUCTURE_HEADER_TITLE,
    subtitle: DWELLING_STRUCTURE_HEADER_SUBTITLE,
    requiredRows: [
      "Separate house",
      "Semi-detached, row or terrace house, townhouse etc",
      "Flat or apartment",
      "Other dwelling",
    ],
  });

  if (!dwellingStructureTable) {
    return null;
  }

  const numberOfBedroomsTable = findTableByHeader($, {
    title: NUMBER_OF_BEDROOMS_HEADER_TITLE,
    subtitle: NUMBER_OF_BEDROOMS_HEADER_SUBTITLE,
    requiredRows: [
      "None (includes studio apartments or bedsitters)",
      "1 bedroom",
      "2 bedrooms",
      "3 bedrooms",
      "4 or more bedrooms",
      "Number of bedrooms not stated",
      "Average number of bedrooms per dwelling",
      "Average number of people per household",
    ],
  });

  if (!numberOfBedroomsTable) {
    return null;
  }

  const tenureTypeTable = findTableByHeader($, {
    title: TENURE_TYPE_HEADER_TITLE,
    subtitle: TENURE_TYPE_HEADER_SUBTITLE,
    requiredRows: [
      "Owned outright",
      "Owned with a mortgage (a)",
      "Rented (b)",
      "Other tenure type (c)",
      "Tenure type not stated",
    ],
  });

  if (!tenureTypeTable) {
    return null;
  }

  const rentWeeklyPaymentsTable = findTableByHeader($, {
    title: RENT_WEEKLY_PAYMENTS_HEADER_TITLE,
    subtitle: RENT_WEEKLY_PAYMENTS_HEADER_SUBTITLE,
    requiredRows: [
      "Median rent (a)",
      "Renter households where rent payments are less than or equal to 30% of household income (b)",
      "Renter households with rent payments greater than 30% of household income (b)",
      "Unable to determine (c)",
    ],
  });

  if (!rentWeeklyPaymentsTable) {
    return null;
  }

  const mortgageMonthlyRepaymentsTable = findTableByHeader($, {
    title: MORTGAGE_MONTHLY_REPAYMENTS_HEADER_TITLE,
    subtitle: MORTGAGE_MONTHLY_REPAYMENTS_HEADER_SUBTITLE,
    requiredRows: [
      "Median mortgage repayments",
      "Owner with mortgage households where mortgage repayments are less than or equal to 30% of household income (a)",
      "Owner with mortgage households with mortgage repayments greater than 30% of household income (a)",
      "Unable to determine (b)",
    ],
  });

  if (!mortgageMonthlyRepaymentsTable) {
    return null;
  }

  const employmentRows = parseEmploymentRows($, employmentTable);
  const occupationRows = parseOccupationRows($, occupationTable);
  const industryRows = parseIndustryRows($, industryTable);
  const medianIncomeRows = parseMedianIncomeRows($, medianIncomeTable);
  const methodOfTravelRows = parseMethodOfTravelRows($, methodOfTravelTable);
  const familyCompositionRows = parseFamilyCompositionRows(
    $,
    familyCompositionTable,
  );
  const dwellingStructureRows = parseDwellingStructureRows(
    $,
    dwellingStructureTable,
  );
  const numberOfBedroomsRows = parseNumberOfBedroomsRows(
    $,
    numberOfBedroomsTable,
  );
  const tenureTypeRows = parseTenureTypeRows($, tenureTypeTable);
  const rentWeeklyPaymentRows = parseRentWeeklyPaymentRows(
    $,
    rentWeeklyPaymentsTable,
  );
  const mortgageMonthlyRepaymentRows = parseMortgageMonthlyRepaymentRows(
    $,
    mortgageMonthlyRepaymentsTable,
  );

  if (
    !peopleRows ||
    !maritalRows ||
    !educationRows ||
    !laborRows ||
    !employmentRows ||
    !occupationRows ||
    !industryRows ||
    !medianIncomeRows ||
    !methodOfTravelRows ||
    !familyCompositionRows ||
    !dwellingStructureRows ||
    !numberOfBedroomsRows ||
    !tenureTypeRows ||
    !rentWeeklyPaymentRows ||
    !mortgageMonthlyRepaymentRows
  ) {
    return null;
  }

  return {
    people: peopleRows,
    maritalStatus: maritalRows,
    education: educationRows,
    laborForce: laborRows,
    employmentStatus: employmentRows,
    occupationTopResponses: occupationRows,
    industryTopResponses: industryRows,
    medianWeeklyIncomes: medianIncomeRows,
    methodOfTravelToWork: methodOfTravelRows,
    familyComposition: familyCompositionRows,
    dwellingStructure: dwellingStructureRows,
    numberOfBedrooms: numberOfBedroomsRows,
    tenureType: tenureTypeRows,
    rentWeeklyPayments: rentWeeklyPaymentRows,
    mortgageMonthlyRepayments: mortgageMonthlyRepaymentRows,
  };
}

interface TableQuery {
  title: string;
  subtitle?: string;
  requiredRows: string[];
}

function findTableByHeader(
  $: CheerioAPI,
  query: TableQuery,
): Element | null {
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

    if (!hasRows($, table, query.requiredRows)) {
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

function hasRows(
  $: CheerioAPI,
  table: Element,
  labels: string[],
): boolean {
  return labels.every((label) => Boolean(findRow($, table, label)));
}

function findRow(
  $: CheerioAPI,
  table: Element,
  targetLabel: string,
): Cheerio<Element> | null {
  const normalizedTarget = normalizeLabel(targetLabel);

  const row = $(table)
    .find("tr")
    .filter((_, element) => {
      const header = $(element).find("th").first();
      if (!header.length) {
        return false;
      }
      return normalizeLabel(header.text()) === normalizedTarget;
    })
    .first();

  return row.length ? row : null;
}

function parsePeopleRows($: CheerioAPI, table: Element): TableRow[] | null {
  const male = extractRowByLabel($, table, "Male");
  const female = extractRowByLabel($, table, "Female");

  if (!male || !female) {
    return null;
  }

  return [male, female];
}

function parseMaritalRows($: CheerioAPI, table: Element): TableRow[] | null {
  const rows = [
    "Married",
    "Separated",
    "Divorced",
    "Widowed",
    "Never married",
  ].map((label) => extractRowByLabel($, table, label));

  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseEducationRows($: CheerioAPI, table: Element): TableRow[] | null {
  const bachelorOrAbove = extractRowByLabel(
    $,
    table,
    "Bachelor Degree level and above",
  );
  const advancedDiploma = extractRowByLabel(
    $,
    table,
    "Advanced Diploma and Diploma level",
  );
  const certificateIV = extractRowByLabel($, table, "Certificate level IV");
  const certificateIII = extractRowByLabel($, table, "Certificate level III");
  const year12 = extractRowByLabel($, table, "Year 12");
  const year11 = extractRowByLabel($, table, "Year 11");
  const year10 = extractRowByLabel($, table, "Year 10");
  const certificateII = extractRowByLabel($, table, "Certificate level II");
  const certificateI = extractRowByLabel($, table, "Certificate level I");
  const year9OrBelow = extractRowByLabel($, table, "Year 9 or below");
  const inadequatelyDescribed = extractRowByLabel(
    $,
    table,
    "Inadequately described",
  );
  const noEducationalAttainment = extractRowByLabel(
    $,
    table,
    "No educational attainment",
  );
  const notStated = extractRowByLabel($, table, "Not stated");

  const rows = [
    bachelorOrAbove,
    advancedDiploma,
    certificateIV,
    certificateIII,
    year12,
    year11,
    year10,
    certificateII,
    certificateI,
    year9OrBelow,
    inadequatelyDescribed,
    noEducationalAttainment,
    notStated,
  ];

  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseLaborForceRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const inLaborForce = extractRowByLabel($, table, "In the labour force");
  const notInLaborForce = extractRowByLabel(
    $,
    table,
    "Not in the labour force",
  );
  const notStated = extractRowByLabel($, table, "Not stated");

  if (!inLaborForce || !notInLaborForce || !notStated) {
    return null;
  }

  return [inLaborForce, notInLaborForce, notStated];
}

function parseEmploymentRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const workedFullTime = extractRowByLabel($, table, "Worked full-time");
  const workedPartTime = extractRowByLabel($, table, "Worked part-time");
  const awayFromWork = extractRowByLabel($, table, "Away from work (a)");
  const unemployed = extractRowByLabel($, table, "Unemployed");

  if (!workedFullTime || !workedPartTime || !awayFromWork || !unemployed) {
    return null;
  }

  return [workedFullTime, workedPartTime, awayFromWork, unemployed];
}

function parseOccupationRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const labels = [
    "Professionals",
    "Managers",
    "Community and Personal Service Workers",
    "Technicians and Trades Workers",
    "Clerical and Administrative Workers",
    "Labourers",
    "Sales Workers",
    "Machinery Operators and Drivers",
  ];

  const rows = labels.map((label) => extractRowByLabel($, table, label));
  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseIndustryRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const labels = [
    "Cafes and Restaurants",
    "Computer System Design and Related Services",
    "Banking",
    "Other Auxiliary Finance and Investment Services",
    "Building and Other Industrial Cleaning Services",
  ];

  const rows = labels.map((label) => extractRowByLabel($, table, label));
  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseMedianIncomeRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const labels = ["Personal (b)", "Family (c)", "Household (d)"];
  const rows = labels.map((label) =>
    extractRowByLabel($, table, label, {
      stripCurrency: true,
      allowMissingPercentage: true,
    }),
  );

  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseMethodOfTravelRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const labels = [
    "Walked only",
    "Car, as driver",
    "Train",
    "Bus",
    "Train, bus",
    "Did not go to work",
    "Worked at home",
    "People who travelled to work by public transport (a)",
    "People who travelled to work by car as driver or passenger (b)",
  ];

  const rows = labels.map((label) => extractRowByLabel($, table, label));
  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseFamilyCompositionRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const labels = [
    "Couple family without children",
    "Couple family with children",
    "One parent family",
    "Other family",
  ];

  const rows = labels.map((label) => extractRowByLabel($, table, label));
  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseDwellingStructureRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const labels = [
    "Separate house",
    "Semi-detached, row or terrace house, townhouse etc",
    "Flat or apartment",
    "Other dwelling",
  ];

  const rows = labels.map((label) => extractRowByLabel($, table, label));
  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseNumberOfBedroomsRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const entries: Array<{ label: string; options?: ExtractRowOptions }> = [
    { label: "None (includes studio apartments or bedsitters)" },
    { label: "1 bedroom" },
    { label: "2 bedrooms" },
    { label: "3 bedrooms" },
    { label: "4 or more bedrooms" },
    { label: "Number of bedrooms not stated" },
    {
      label: "Average number of bedrooms per dwelling",
      options: { allowMissingPercentage: true },
    },
    {
      label: "Average number of people per household",
      options: { allowMissingPercentage: true },
    },
  ];

  const rows = entries.map(({ label, options }) =>
    extractRowByLabel($, table, label, options),
  );

  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseTenureTypeRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const labels = [
    "Owned outright",
    "Owned with a mortgage (a)",
    "Rented (b)",
    "Other tenure type (c)",
    "Tenure type not stated",
  ];

  const rows = labels.map((label) => extractRowByLabel($, table, label));
  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseRentWeeklyPaymentRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const entries: Array<{ label: string; options?: ExtractRowOptions }> = [
    {
      label: "Median rent (a)",
      options: { stripCurrency: true, allowMissingPercentage: true },
    },
    {
      label:
        "Renter households where rent payments are less than or equal to 30% of household income (b)",
    },
    {
      label:
        "Renter households with rent payments greater than 30% of household income (b)",
    },
    { label: "Unable to determine (c)" },
  ];

  const rows = entries.map(({ label, options }) =>
    extractRowByLabel($, table, label, options),
  );

  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function parseMortgageMonthlyRepaymentRows(
  $: CheerioAPI,
  table: Element,
): TableRow[] | null {
  const entries: Array<{ label: string; options?: ExtractRowOptions }> = [
    {
      label: "Median mortgage repayments",
      options: { stripCurrency: true, allowMissingPercentage: true },
    },
    {
      label:
        "Owner with mortgage households where mortgage repayments are less than or equal to 30% of household income (a)",
    },
    {
      label:
        "Owner with mortgage households with mortgage repayments greater than 30% of household income (a)",
    },
    { label: "Unable to determine (b)" },
  ];

  const rows = entries.map(({ label, options }) =>
    extractRowByLabel($, table, label, options),
  );

  if (rows.some((row) => !row)) {
    return null;
  }

  return rows as TableRow[];
}

function extractRowByLabel(
  $: CheerioAPI,
  table: Element,
  label: string,
  options?: ExtractRowOptions,
): TableRow | null {
  const row = findRow($, table, label);
  if (!row) {
    return null;
  }

  return extractRow($, row, options);
}

function extractRow(
  $: CheerioAPI,
  row: Cheerio<Element>,
  options?: ExtractRowOptions,
): TableRow | null {
  const cells = row.find("td");
  if (cells.length < 2) {
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

  const percentageText = cleanNumericText(cells.eq(1).text());
  if (!percentageText && !options?.allowMissingPercentage) {
    return null;
  }

  const percentage = percentageText ? Number.parseFloat(percentageText) : null;
  if (percentage !== null && Number.isNaN(percentage)) {
    return null;
  }

  const label = normalizeWhitespace(row.find("th").first().text());

  return {
    label,
    count,
    percentage,
  };
}

function cleanNumericText(value: string): string {
  return value.replace(/[^0-9.,-]/g, "").trim();
}

function normalizeLabel(value: string): string {
  return normalizeWhitespace(value).toLowerCase();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
