import { v } from "convex/values";
import { query } from "../_generated/server";

export const getSuburbIdByName = query({
    args: {
        postcode: v.string(),
    },
    handler: async (ctx, { postcode }) => {
        const suburb = await ctx.db
            .query("suburbs")
            .withIndex("by_postcode", (q) =>
                q.eq("postcode", postcode),
            )
            .first();
        if (!suburb) {
            throw new Error(`Suburb with postcode ${postcode} not found`);
        }
        return suburb._id;
    }
})