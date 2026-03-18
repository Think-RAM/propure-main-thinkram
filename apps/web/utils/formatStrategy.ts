import { Doc } from "@propure/convex/genereated";

const formatLabel = (str?: string) => {
  if (!str) return "Not specified";
  return str
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatNumber = (num?: number) => {
  if (num === undefined || num === null) return "Not specified";
  return num.toLocaleString("en-US");
};

const serializeParams = (params?: any): string[] => {
  if (!params || typeof params !== "object") return [];

  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      let formattedValue: string;

      if (Array.isArray(value)) {
        formattedValue = value.join(", ");
      } else if (typeof value === "object") {
        // flatten shallow objects
        formattedValue = Object.entries(value!)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      } else {
        formattedValue = String(value);
      }

      return `- ${key}: ${formattedValue}`;
    });
};

export function buildStrategyPromptContext(strategy: Doc<"strategies">): string {
  const sections: string[] = [];

  // Header
  sections.push(`[INVESTOR STRATEGY CONTEXT]`);

  // Core Info
  sections.push(
    `Strategy Type: ${formatLabel(strategy.type)}`,
    `Status: ${formatLabel(strategy.status)}`
  );

  // Financials
  sections.push(`\nFinancial Profile:`);
  sections.push(
    `- Budget: ${formatNumber(strategy.budget)}`,
    `- Deposit: ${formatNumber(strategy.deposit)}`,
    `- Income: ${formatNumber(strategy.income)}`
  );

  // Preferences
  sections.push(`\nRisk & Preferences:`);
  sections.push(
    `- Risk Tolerance: ${formatLabel(strategy.riskTolerance)}`,
    `- Timeline: ${strategy.timeline ?? "Not specified"}`,
    `- Management Style: ${formatLabel(strategy.managementStyle)}`
  );

  // Params (dynamic)
  const paramLines = serializeParams(strategy.params);
  if (paramLines.length > 0) {
    sections.push(`\nCustom Parameters:`);
    sections.push(...paramLines);
  }

  return sections.join("\n");
}