import { ConvexHttpClient } from "convex/browser";

if (!process.env.CONVEX_URL && !process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("CONVEX_URL is not defined in environment variables");
}

const CONVEX_URL = (process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL)!;

const client = new ConvexHttpClient(CONVEX_URL);

export { client };
