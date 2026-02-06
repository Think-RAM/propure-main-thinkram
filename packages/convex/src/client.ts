import { ConvexHttpClient } from "convex/browser";

// if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
//   throw new Error(
//     "NEXT_PUBLIC_CONVEX_URL is not defined in environment variables",
//   );
// }

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL! || "");

export { client };
