import Stripe from "stripe";
import { Config } from "sst/node/config";
import handler from "@mox-rental-tools-vanilla/core/handler";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";
import { Table } from "sst/node/table";

export const main = handler(async (event) => {

    const stripe = new Stripe(Config.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
    });
    const endpointSecret = "whsec_YFDUFTqwHZHUuFJ5ZPPRwJk77ukc1Xj2";

    const fullFillOrder = async (sessionWithLineItems: Stripe.Checkout.Session) => {
        const lineItems = sessionWithLineItems.line_items;
        const priceId = lineItems?.data[0].price?.id;
        const userId = sessionWithLineItems.client_reference_id;
        const customerEmail = sessionWithLineItems.customer_email;
        const userRole = sessionWithLineItems.metadata!.userRole;
        // console.log(`successful stripe payment for userId - ${userId} and email - ${customerEmail} and priceId - ${priceId}`);
        const timestamp = Date.now();
        const params = {
            TableName: Table.StripePurchases.tableName,
            Item: {
                // The attributes of the item to be created
                userId: userId,
                customerEmail: customerEmail,
                timestamp: timestamp, // Current Unix timestamp
                priceId: priceId,
                userRole: userRole,
                sessionId: sessionWithLineItems.id,
                expiration: timestamp + 86400000 * 30,
            },
        };
        
        await dynamoDb.put(params);
    }

    try {
        const data = JSON.parse(event.body || "{}");
        const sig = event.headers?.["stripe-signature"] || "";
        const stripeEvent = stripe.webhooks.constructEvent(event.body || "{}", sig, endpointSecret);
        
        // Handle the checkout.session.completed event
        if (stripeEvent.type === 'checkout.session.completed') {
            // Retrieve the session. If you require line items in the response, you may include them by expanding line_items.
            const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
                stripeEvent.data.object.id,
            {
                expand: ['line_items'],
            }
            );
            // Fulfill the purchase...
            await fullFillOrder(sessionWithLineItems);
  }

    } catch (err) {
        throw err
    }
    

    return JSON.stringify({  });
});