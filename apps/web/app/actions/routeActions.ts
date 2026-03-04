"use server";

// import { fetchRoutesFromDb, updateRoutesStatusInDb } from '@/lib/mockDb';
// import { Route } from "@/lib/store/routeSlice";
import { client } from "@propure/convex/client";
import { api, Doc } from "@propure/convex/genereated";

export async function fetchRoutesAction(): Promise<
  Doc<"scrapping_locations">[]
> {
  try {
    const routes = await client.query(api.functions.scrapingLocations.listAll);
    return routes;
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw new Error("Failed to fetch routes from database");
  }
}

export async function updateRoutesStatusAction(
  selectedIds: Doc<"scrapping_locations">[],
  newStatus: "pending" | "done" | "failed",
): Promise<Doc<"scrapping_locations">[]> {
  try {
    if (selectedIds.length === 0) {
      throw new Error("No routes selected for update");
    }

    const data = selectedIds.map((id) => ({
      ...id,
      status: newStatus,
    }));

    const updatedRoutes = await client.mutation(
      api.functions.scrapingLocations.bulkUpsert,
      {
        locations: data.map((route) => ({
          //   _id: route._id,
          state: route.state,
          postcode: route.postcode,
          suburb: route.suburb,
          status: route.status,
        })),
      },
    );
    return data;
  } catch (error) {
    console.error("Error updating routes status:", error);
    throw new Error("Failed to update routes status");
  }
}