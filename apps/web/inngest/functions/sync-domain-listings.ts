import { inngest } from "../client";

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
    // Retry configuration
    retries: 3,
  },
  // Trigger: scheduled cron or manual event
  { event: "property/sync.requested" },
  async ({ event, step }) => {
    // Step 1: Fetch listings from Domain API
    const listings = await step.run("fetch-domain-listings", async () => {
      // TODO: Implement Domain API fetch
      // const response = await fetch(`https://api.domain.com.au/...`);
      console.log("Fetching listings from Domain API...");
      return { count: 0, listings: [] };
    });

    // Step 2: Process and store listings
    await step.run("store-listings", async () => {
      // TODO: Store listings in database using Prisma
      console.log(`Storing ${listings.count} listings...`);
    });

    // Step 3: Update suburb metrics if needed
    if (listings.count > 0) {
      await step.sendEvent("trigger-metrics-update", {
        name: "suburb/metrics.update",
        data: { suburbIds: [] }, // TODO: Extract suburb IDs
      });
    }

    return { synced: listings.count };
  },
);
