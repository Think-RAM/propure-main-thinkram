import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { functions } from "@/inngest/functions";

// Create the Inngest API route handler
// This endpoint is used by Inngest to:
// - Discover functions (GET)
// - Trigger function execution (POST)
// - Handle webhooks (PUT)
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
