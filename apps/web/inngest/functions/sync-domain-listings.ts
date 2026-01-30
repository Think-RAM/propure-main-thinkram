import { z } from "zod";
import { inngest } from "../client";
import { domainTools } from "@/lib/mcp/client";
import type { PropertyListing } from "@propure/mcp-shared";

// Zod schema for event data validation
const SyncListingsEventSchema = z.object({
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
 * Transform a Domain API property listing to Property model
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
    source: "DOMAIN" as const,
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
 * Sync property listings from Domain via MCP
 *
 * This function fetches property listings from Domain.com.au via our MCP server
 * and stores them in the database. It can be triggered:
 * - On a schedule (cron)
 * - Manually via event
 * - When a user requests fresh data for a suburb
 */
export const syncDomainListings = inngest.createFunction(
  {
    id: "sync-domain-listings",
    name: "Sync Domain Listings",
    retries: 3,
    concurrency: { limit: 5 },
  },
  [
    { event: "property/sync.requested" },
    { cron: "0 3 * * *" }, // Daily at 3 AM AEST
  ],
  async ({ event, step }) => {
    // Validate event data with Zod (cron trigger may not have event.data)
    const eventData = event?.data || {};
    const parseResult = SyncListingsEventSchema.safeParse(eventData);
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
        // TODO: Replace with actual DB fetch
        return [] as any[];
      }
      if (suburbIds && suburbIds.length > 0) {
        // TODO: Replace with actual DB fetch
        return [] as any[];
      }
      // Otherwise, get stale suburbs (not updated in 24 hours)
      const staleDate = forceRefresh
        ? new Date() // All suburbs if force refresh
        : new Date(Date.now() - 24 * 60 * 60 * 1000);
      // TODO: Replace with actual DB fetch
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
          // TODO: Replace with actual MCP call
          return {} as any
        } catch (error) {
          console.error(`Failed to fetch listings for ${suburb.name}:`, error);
          return { listings: [], totalCount: 0, hasMore: false };
        }
      });

      const { listings } = result;

      if (listings.length === 0) {
        continue;
      }

      // Store listings
      // Note: listing.externalId already includes the 'domain-' prefix from the parser
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

      // Add a small delay between suburbs to respect rate limits
      await step.sleep(`rate-limit-delay-${suburb.id}`, "1s");
    }

    // Step 3: Trigger metrics recalculation if we synced any listings
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
