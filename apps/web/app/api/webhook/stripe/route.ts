import clerkClient from "@/lib/clerk";
import { PlanToPrice } from "@/types/types";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const buf = Buffer.from(await request.arrayBuffer());
    const sig = request.headers.get("stripe-signature")!;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new NextResponse("Webhook Error", { status: 400 });
    }
    let subscription;
    let status;
    switch (event.type) {
      case "customer.subscription.created":
        subscription = event.data.object;
        status = subscription.status;
        const userId = subscription.metadata.userId;
        console.log("Subscription metadata:", subscription.metadata);
        if (!userId) {
          console.error("User ID not found in subscription metadata");
          return new NextResponse("User ID not found", { status: 400 });
        }
        // Here you can handle the subscription creation logic, e.g., save to your database
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: {
            subscriptionPlan:
              PlanToPrice[
                subscription.items.data[0].price.id as keyof typeof PlanToPrice
              ],
            subscriptionStatus: status,
            subscriptionId: subscription.id,
          },
        });
        console.log(
          "Subscription created:",
          subscription.id,
          "Status:",
          status
        );
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        subscription = event.data.object as Stripe.Subscription;
        status = subscription.status;
        const userIdUpdated = subscription.metadata.userId;
        console.log("Subscription metadata:", subscription.metadata);

        if (!userIdUpdated) {
          console.error(
            "User ID not found in subscription metadata (update/delete)"
          );
          return new NextResponse("User ID not found", { status: 400 });
        }

        if (status === "active" && subscription.cancel_at !== null) {
          await clerkClient.users.updateUserMetadata(userIdUpdated, {
            publicMetadata: {
              subscriptionEndDate: subscription.cancel_at!,
            },
          });
        }

        // Handle expired, canceled, or unpaid subscriptions
        if (
          status === "canceled" ||
          status === "unpaid" ||
          status === "incomplete_expired"
        ) {
          await clerkClient.users.updateUserMetadata(userIdUpdated, {
            publicMetadata: {
              subscriptionPlan: undefined, // Downgrade user to builderStarter plan
              subscriptionStatus: status,
              subscriptionId: subscription.id,
              subscriptionEndDate: subscription.cancel_at ?? undefined,
            },
          });

          console.log(
            `Subscription ${subscription.id} for user ${userIdUpdated} has ended. Status: ${status}`
          );
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return new NextResponse("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
