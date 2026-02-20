import { verifyAndCreateUser } from "@/lib/auth/user";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    if (!evt)
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });

    //switch case for event type
    switch (evt.type) {
      case "user.created":
        // console.log("\n\nUser created event received\n\n");

        const userResponse = await verifyAndCreateUser(evt.data);
        if (userResponse.success) {
          console.log(userResponse);
          return new Response(userResponse.message, { status: 200 });
        }
        console.log(userResponse);
        break;

      case "user.deleted":
        console.log("User deleted event received");
        break;
      default:
        console.log(`Unhandled event type: ${evt.type}`);
    }

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`,
    );
    // console.log("Webhook payload:", evt.data);

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
