import Stripe from "stripe";
import { Config } from "sst/node/config";
import handler from "@mox-rental-tools-vanilla/core/handler";

export const main = handler(async (event) => {

    const stripe = new Stripe(Config.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
      });

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "USD",
        amount: 20000,
        automatic_payment_methods: { enabled: true},
      });

      return JSON.stringify({ clientSecret: paymentIntent.client_secret });
});

