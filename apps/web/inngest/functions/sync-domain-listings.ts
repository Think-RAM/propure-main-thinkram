import { z } from "zod";
import { inngest } from "../client";
import { prisma } from "@propure/db";

// Zod schema for event data validation
const SyncListingsEventSchema = z.object({
  suburbIds: z.array(z.string()).optional(),
  forceRefresh: z.boolean().optional().default(false),
});

/**
 * Sync property listings from Domain API
 *
 * This function fetches new property listings from the Domain API
 * and stores them in the database. It can be triggered:
 * - On a schedule (e.g., every hour)
 * - Manually via event
 * - When a user requests fresh data for a suburb
 */
export const syncDomainListings = inngest.createFunction(
  {
    id: "sync-domain-listings",
    name: "Sync Domain Listings",
    retries: 3,
  },
  { event: "property/sync.requested" },
  async ({ event, step }) => {
    // Validate event data with Zod
    const parseResult = SyncListingsEventSchema.safeParse(event.data);
    if (!parseResult.success) {
      console.error("Invalid event data:", parseResult.error.flatten());
      return {
        error: "Invalid event data",
        details: parseResult.error.flatten(),
      };
    }
    const { suburbIds, forceRefresh } = parseResult.data;

    // Step 1: Fetch listings from Domain API
    const listings = await step.run("fetch-domain-listings", async () => {
      try {
        // TODO: Implement Domain API fetch
        // const apiKey = process.env.DOMAIN_API_KEY;
        // const response = await fetch(`https://api.domain.com.au/...`, {
        //   headers: { 'X-Api-Key': apiKey }
        // });
        console.log(
          `Fetching listings from Domain API (suburbs: ${suburbIds?.join(", ") || "all"}, forceRefresh: ${forceRefresh})...`,
        );
        return { count: 0, listings: [] as Array<Record<string, unknown>> };
      } catch (error) {
        console.error("Failed to fetch from Domain API:", error);
        throw error;
      }
    });

    // Step 2: Process and store listings
    const storedCount = await step.run("store-listings", async () => {
      try {
        if (listings.listings.length === 0) {
          console.log("No listings to store");
          return 0;
        }

        // TODO: Transform Domain API response to Prisma Property model
        // and upsert into database
        // await prisma.property.createMany({
        //   data: transformedListings,
        //   skipDuplicates: true,
        // });

        console.log(`Storing ${listings.count} listings...`);
        return listings.count;
      } catch (error) {
        console.error("Failed to store listings:", error);
        throw error;
      }
    });

    // Step 3: Update suburb metrics if needed
    if (storedCount > 0) {
      await step.sendEvent("trigger-metrics-update", {
        name: "suburb/metrics.update",
        data: { suburbIds: suburbIds || [] },
      });
    }

    return { synced: storedCount };
  },
);
