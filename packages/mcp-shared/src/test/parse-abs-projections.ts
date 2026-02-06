import { readFileSync } from "fs";
import { join } from "path";
import { parseAbsPopulationProjections } from "../parsers/abs-parser";

function run() {
  const p = join(__dirname, "data", "abs-projections-sample.html");
  const html = readFileSync(p, "utf-8");
  const results = parseAbsPopulationProjections(html);
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) run();
