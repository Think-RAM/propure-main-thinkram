import { Inngest } from "inngest";

// Create the Inngest client
// This is used to define functions and send events
export const inngest = new Inngest({
  id: "propure",
  // In production, set INNGEST_EVENT_KEY environment variable
});
