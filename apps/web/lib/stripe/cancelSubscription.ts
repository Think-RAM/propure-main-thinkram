'use server';
import Stripe from "stripe";

export async function cancelSubscription(subscriptionId: string, atPeriodEnd = true) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: atPeriodEnd,
    });

    return canceledSubscription.id;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}
