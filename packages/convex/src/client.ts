import { ConvexHttpClient } from "convex/browser";

if(!process.env.CONVEX_URL){
  throw new Error("CONVEX_URL is not defined in environment variables");
}

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

export { client };
