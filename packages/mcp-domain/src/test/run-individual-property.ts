import fs from "fs";
import path from "path";
import { parseDomainPropertyListing } from "../../../mcp-shared/src/parsers/domain-parser";



export function openHtmlFile(filePath: string): string | null {
  try {
    const absolutePath = path.resolve(filePath);
    const htmlContent = fs.readFileSync(absolutePath, "utf-8");
    console.log("HTML content successfully read into a string.");
    return htmlContent;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      console.error(`Error: The file '${filePath}' was not found.`);
    } else {
      console.error("An error occurred while reading the file:", error);
    }
    return null;
  }
}


// Example usage:
const html = openHtmlFile(
  "D:/work/domain_scrapper/domain-property-details.html"
);

if (html) {
  const result = parseDomainPropertyListing(
    html,
    "sale", // or "rent" | "sold"
    "https://www.domain.com.au/example-listing"
  );

  console.log(result);
}
