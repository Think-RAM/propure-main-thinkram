import { buildSearchUrl } from "../src/scrapers/rea-scraper";
import type { PropertySearchParams } from "@propure/mcp-shared";

// Minimal harness to print sample URLs for manual inspection.
const scenarios: Array<{ name: string; params: PropertySearchParams }> = [
  {
    name: "Sale: suburb + state + price + beds",
    params: {
      suburbs: ["Bondi Beach"],
      state: "NSW",
      postcode: "2026",
      minPrice: 1200000,
      maxPrice: 2000000,
      minBeds: 2,
      maxBeds: 3,
      listingType: "sale",
      // pageSize: 20,
      page: 1,
    },
  },
  {
    name: "Rent: suburb + state + baths + page 2",
    params: {
      suburbs: ["St Kilda"],
      state: "VIC",
      postcode: "3182",
      minBaths: 2,
      listingType: "rent",
      // pageSize: 20,
      page: 2,
    },
  },
  {
    name: "Sold: suburb + state only",
    params: {
      suburbs: ["Newtown"],
      state: "NSW",
      listingType: "sold",
      // pageSize: 20,
      page: 1,
    },
  },
  {
    name: "Sale: state only",
    params: {
      state: "QLD",
      listingType: "sale",
      // pageSize: 20,
      page: 1,
    },
  },
  {
    name: "Sale: suburb + property types (house + unit)",
    params: {
      suburbs: ["Manly"],
      state: "NSW",
      postcode: "2095",
      propertyTypes: ["house", "unit"],
      listingType: "sale",
      // pageSize: 20,
      page: 1,
    },
  },
  {
    name: "Sale: suburb + rural land + price filter",
    params: {
      suburbs: ["Fremantle"],
      state: "WA",
      postcode: "6160",
      propertyTypes: ["rural", "land"],
      minPrice: 500000,
      maxPrice: 1500000,
      listingType: "sale",
      // pageSize: 20,
      page: 1,
    },
  },
  {
    name: "Rent: state only (page 3)",
    params: {
      state: "VIC",
      listingType: "rent",
      // pageSize: 20,
      page: 3,
    },
  },
  {
    name: "Sold: suburb + postcode + beds",
    params: {
      suburbs: ["Hawthorn"],
      state: "VIC",
      postcode: "3122",
      minBeds: 3,
      listingType: "sold",
      // pageSize: 20,
      page: 1,
    },
  },
];

scenarios.forEach(({ name, params }, index) => {
  const url = buildSearchUrl(params);
  console.log(`${index + 1}. ${name}`);
  console.log(`   ${url}`);
});
