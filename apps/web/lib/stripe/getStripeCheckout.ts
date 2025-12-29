'use server';
import Stripe from 'stripe';

const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

const getCheckoutSession = async (priceId: string, userId: string) => {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${baseUrl}/dashboard`,
            cancel_url: `${baseUrl}/subscription`,
            subscription_data: {
                metadata: {
                    userId,
                }
            },
        });
        return session.id;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

export default getCheckoutSession;
