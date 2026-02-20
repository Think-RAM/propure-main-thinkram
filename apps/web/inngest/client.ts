import { Inngest } from "inngest";

// Create the Inngest client
// This is used to define functions and send events
export const inngest = new Inngest({
  id: "propure",
  // Production configuration from environment variables
  eventKey: process.env.INNGEST_EVENT_KEY,
  // Signing key for webhook verification in production
  ...(process.env.INNGEST_SIGNING_KEY && {
    signingKey: process.env.INNGEST_SIGNING_KEY,
  }),
});
