import Stripe from "stripe";
import { Config } from "sst/node/config";
import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";

export const main = handler(async (event) => {

    const data = JSON.parse(event.body || "{}");

    verifyRequestUser(event);

    const YOUR_DOMAIN = 'http://localhost:5173/idVerify';
    const stripe = new Stripe(Config.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
    });

    const verificationSession = await stripe.identity.verificationSessions.create({
        type: 'document',
        client_reference_id: `${data.user.userId}`,
        metadata: {
          userId: `${data.user.userId}`,
          userRole: `${data.user.userRole}`,
        },
        options: {
            document: {
                allowed_types: ['driving_license'],
                require_id_number: true,
                require_live_capture: true,
                require_matching_selfie: true,
            },
        },
      });

    return JSON.stringify({ sessionUrl: verificationSession.url });
});