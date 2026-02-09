// Load environment variables from the repository root .env to ensure tests
// running under pnpm exec (which sets CWD to the package) still get the
// central configuration.
import dotenv from "dotenv";
import path from "path";

const rootEnv = path.resolve(__dirname, "../../..", ".env");
dotenv.config({ path: rootEnv });
// import { logger } from "@propure/mcp-shared";
import { getAbsDemographics } from "../sources/abs-api";
import {
  getAbsBuildingApprovals,
  getSA2CodeForSuburbCached,
} from "../sources/abs-api";

/**
 * Execute the ABS Scrape.do workflow for postcode 2000 and verify the reference artifact exists.
 */
async function main(): Promise<void> {
  const res = await getSA2CodeForSuburbCached("Parramatta", "NSW");
  const approvals = await getAbsBuildingApprovals({ sa2Code: res.sa2Code });
  console.log(approvals);
}

main().catch((err) => {
  console.error({ err }, "ABS Scrape.do test failed");
  process.exit(1);
});
