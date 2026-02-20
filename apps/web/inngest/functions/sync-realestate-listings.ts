import { z } from "zod";
import { inngest } from "../client";

import { realestateTools } from "@/lib/mcp/client";
import type { PropertyListing } from "@propure/mcp-shared";

// Zod schema for event data validation
const SyncReaListingsEventSchema = z.object({
  suburbIds: z.array(z.string()).optional(),
  suburbs: z.array(z.string()).optional(),
  state: z
    .enum(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "NT", "ACT"])
    .optional(),
  forceRefresh: z.boolean().optional().default(false),
  listingType: z.enum(["sale", "rent", "sold"]).optional().default("sale"),
  pageSize: z.number().min(1).max(100).optional().default(50),
});

/**
 * Transform a RealEstate.com.au property listing to Property model
 */
function transformListing(listing: PropertyListing, suburbId: string) {
  // Extract address as string from the address object
  const addressStr = listing.address.displayAddress;

  // Extract features from nested object
  const features = listing.features;

  // Calculate rent weekly from price if it's a rental
  let rentWeekly: number | undefined;
  if (listing.listingType === "rent" && listing.priceValue) {
    rentWeekly = listing.priceValue;
  }

  return {
    address: addressStr,
    latitude: listing.address.latitude,
    longitude: listing.address.longitude,
    propertyType: mapPropertyType(features?.propertyType),
    listingType: mapListingType(listing.listingType),
    listingStatus: "ACTIVE" as const,
    source: "REALESTATE" as const,
    sourceUrl: listing.sourceUrl,
    price: listing.priceValue,
    rentWeekly: rentWeekly,
    bedrooms: features?.bedrooms,
    bathrooms: features?.bathrooms,
    carSpaces: features?.parkingSpaces,
    landSize: features?.landSize,
    buildingSize: features?.buildingSize,
    description: listing.description,
    features: features?.features,
    images: listing.images,
    suburbId,
    scrapedAt: new Date(),
  };
}

function mapPropertyType(type: string | undefined) {
  const typeMap: Record<string, string> = {
    house: "HOUSE",
    apartment: "APARTMENT",
    townhouse: "TOWNHOUSE",
    villa: "VILLA",
    unit: "UNIT",
    land: "LAND",
    rural: "RURAL",
    commercial: "COMMERCIAL",
    industrial: "INDUSTRIAL",
  };
  return (typeMap[type?.toLowerCase() || ""] || "HOUSE") as
    | "HOUSE"
    | "APARTMENT"
    | "TOWNHOUSE"
    | "VILLA"
    | "UNIT"
    | "LAND"
    | "RURAL"
    | "COMMERCIAL"
    | "INDUSTRIAL";
}

function mapListingType(type: string | undefined) {
  const typeMap: Record<string, string> = {
    sale: "SALE",
    rent: "RENT",
    sold: "SOLD",
    leased: "LEASED",
  };
  return (typeMap[type?.toLowerCase() || ""] || "SALE") as
    | "SALE"
    | "RENT"
    | "SOLD"
    | "LEASED";
}

/**
 * Sync property listings from RealEstate.com.au via MCP
 *
 * This function fetches property listings from RealEstate.com.au via our MCP server
 * and stores them in the database. REA has stricter rate limits so we process
 * fewer suburbs per run.
 */
export const syncRealestateListings = inngest.createFunction(
  {
    id: "sync-realestate-listings",
    name: "Sync RealEstate.com.au Listings",
    retries: 3,
    concurrency: { limit: 3 }, // Lower than Domain due to stricter rate limits
  },
  [
    { event: "property/sync-rea.requested" },
    { cron: "0 4 * * *" }, // Daily at 4 AM AEST (staggered from Domain)
  ],
  async ({ event, step }) => {
    // Validate event data with Zod (cron trigger may not have event.data)
    const eventData = event?.data || {};
    const parseResult = SyncReaListingsEventSchema.safeParse(eventData);
    if (!parseResult.success) {
      console.error("Invalid event data:", parseResult.error.flatten());
      return {
        error: "Invalid event data",
        details: parseResult.error.flatten(),
      };
    }
    const { suburbIds, suburbs, state, listingType, pageSize, forceRefresh } =
      parseResult.data;

    // Step 1: Get suburbs to sync
    const suburbsToSync = await step.run("get-suburbs-to-sync", async () => {
      if (suburbs && suburbs.length > 0) {
        // If specific suburb names provided, look them up
        return [] as any[];
      }
      if (suburbIds && suburbIds.length > 0) {
        return [] as any[];
      }
      // Get stale suburbs (not updated in 48 hours - less aggressive than Domain)
      const staleDate = forceRefresh
        ? new Date()
        : new Date(Date.now() - 48 * 60 * 60 * 1000);

      return [] as any[];
    });

    if (suburbsToSync.length === 0) {
      return { synced: 0, message: "No suburbs to sync" };
    }

    let totalSynced = 0;

    // Step 2: Fetch and store listings for each suburb
    for (const suburb of suburbsToSync) {
      const suburbState = suburb.city.state.code as
        | "NSW"
        | "VIC"
        | "QLD"
        | "WA"
        | "SA"
        | "TAS"
        | "NT"
        | "ACT";

      // Fetch listings via MCP
      const result = await step.run(`fetch-${suburb.id}`, async () => {
        try {
          return await realestateTools.searchProperties({
            suburbs: [suburb.name],
            state: state || suburbState,
            listingType: listingType,
            // pageSize: pageSize,
            page: 1,
          });
        } catch (error) {
          console.error(
            `Failed to fetch REA listings for ${suburb.name}:`,
            error,
          );
          return { listings: [], totalCount: 0, hasMore: false };
        }
      });

      const { listings } = result;

      if (listings.length === 0) {
        continue;
      }

      // Store listings
      // Note: listing.externalId already includes the 'rea-' prefix from the parser
      const storedCount = await step.run(`store-${suburb.id}`, async () => {
        const operations = [] as any[];

        const results = [] as any[];
        return results.length;
      });

      totalSynced += storedCount;

      // Update suburb's updatedAt timestamp
      await step.run(`update-suburb-${suburb.id}`, async () => {
        // TODO: Replace with actual DB update
        return [];
      });

      // Add a small delay between suburbs to respect rate limits (longer for REA)
      await step.sleep(`rate-limit-delay-${suburb.id}`, "2s");
    }

    // Step 3: Trigger metrics recalculation
    if (totalSynced > 0) {
      await step.sendEvent("trigger-metrics-update", {
        name: "suburb/metrics.update",
        data: { suburbIds: suburbsToSync.map((s) => s.id) },
      });
    }

    return {
      synced: totalSynced,
      suburbs: suburbsToSync.map((s) => s.name),
    };
  },
);
