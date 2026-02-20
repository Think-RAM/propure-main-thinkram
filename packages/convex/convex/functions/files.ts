// import { v } from "convex/values";

// import { dataSource } from "../schema";
// import { mutation } from "../_generated/server";

// export const generateUploadUrl = mutation({
//   args: {},
//   handler: async (ctx) => {
//     return ctx.storage.generateUploadUrl();
//   },
// });

// export const saveFileRecord = mutation({
//   args: {
//     storageId: v.id("_storage"),
//     fileName: v.optional(v.string()),
//     contentType: v.string(),
//     fileSize: v.optional(v.float64()),
//     source: v.optional(dataSource),
//     sourceUrl: v.optional(v.string()),
//     metadata: v.optional(v.any()),
//   },
//   handler: async (
//     ctx,
//     { storageId, fileName, contentType, fileSize, source, sourceUrl, metadata },
//   ) => {
//     const now = Date.now();

//     const recordId = await ctx.db.insert("files", {
//       storageId,
//       fileName,
//       contentType,
//       fileSize,
//       source,
//       sourceUrl,
//       metadata,
//       createdAt: now,
//       updatedAt: now,
//     });

//     return recordId;
//   },
// });
