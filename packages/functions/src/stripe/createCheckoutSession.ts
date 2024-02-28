import Stripe from "stripe";
import { Config } from "sst/node/config";
import handler from "@mox-rental-tools-vanilla/core/handler";

export const main = handler(async (event) => {

    let priceIds: Record<string, string> = {
        'tenant': 'price_1OodrYDQM8goeywJCr0hxO8y',
        'landlord': 'price_1Ooe4VDQM8goeywJIXZ0leoL',
        'agent': 'price_1Ooe4VDQM8goeywJIXZ0leoL',
    };
    const userRole = JSON.parse(event.body || "{}").userRole as string;
    const YOUR_DOMAIN = 'http://localhost:5173/purchase';
    const stripe = new Stripe(Config.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
    });

    const session = await stripe.checkout.sessions.create({
    line_items: [
        {
            price: `${priceIds[userRole]}`,
            quantity: 1,
        },
    ],
    mode: "payment",
    success_url: `${YOUR_DOMAIN}?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
    automatic_tax: {enabled: true},
    });

    return JSON.stringify({ sessionUrl: session.url });
});