import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { logger, parseAbsMarketData } from "@propure/mcp-shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse the stored ABS reference HTML for postcode 2000 and log the structured market data.
 */
async function main(): Promise<void> {
  const referencePath = path.resolve(
    __dirname,
    "../reference/abs/POA2000.html",
  );

  const html = await fs.readFile(referencePath, "utf8");
  const result = parseAbsMarketData(html);

  if (!result) {
    throw new Error("Failed to parse ABS market data");
  }

  logger.info(
    {
      people: result.people,
      maritalStatus: result.maritalStatus,
      education: result.education,
      laborForce: result.laborForce,
      employmentStatus: result.employmentStatus,
      occupationTopResponses: result.occupationTopResponses,
      industryTopResponses: result.industryTopResponses,
      medianWeeklyIncomes: result.medianWeeklyIncomes,
      methodOfTravelToWork: result.methodOfTravelToWork,
      familyComposition: result.familyComposition,
      dwellingStructure: result.dwellingStructure,
      numberOfBedrooms: result.numberOfBedrooms,
      tenureType: result.tenureType,
      rentWeeklyPayments: result.rentWeeklyPayments,
      mortgageMonthlyRepayments: result.mortgageMonthlyRepayments,
    },
    "Parsed ABS market data",
  );
}

main().catch((err) => {
  logger.error({ err }, "ABS parser test failed");
  process.exit(1);
});
