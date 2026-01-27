import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

export { client };
