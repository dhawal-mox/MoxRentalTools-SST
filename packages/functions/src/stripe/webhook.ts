import Stripe from "stripe";
import { Config } from "sst/node/config";
import handler from "@mox-rental-tools-vanilla/core/handler";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";
import { Table } from "sst/node/table";
import { editStatusDetail, getUserOnboardingStatus, updateUserOnboardingStatus } from "src/users/onboardingStatus";

export const main = handler(async (event) => {

    let stripe = new Stripe(Config.STRIPE_SECRET_KEY, {
        apiVersion: "2023-10-16",
    });
    // const endpointSecret = "whsec_72NhqHjJC8ogygbPDJMvGGcpN07SqRan";
    const endpointSecret = Config.STRIPE_WEBHOOK_SECRET;

    const data = JSON.parse(event.body || "{}");
    const sig = event.headers?.["stripe-signature"] || "";
    let stripeEvent = stripe.webhooks.constructEvent(event.body || "{}", sig, endpointSecret);
    
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
    } else if(stripeEvent.type === "identity.verification_session.verified") {
        // we will have to use the restricted key
        stripe = new Stripe(Config.STRIPE_RESTRICTED_KEY, {
            apiVersion: "2023-10-16",
        });
        stripeEvent = stripe.webhooks.constructEvent(event.body || "{}", sig, endpointSecret);
        if(stripeEvent.type != "identity.verification_session.verified") {
            throw "mismatch event type!";
        }
        const verificationSession = await stripe.identity.verificationSessions.retrieve(
            stripeEvent.data.object.id,
            {
                expand: [
                    'verified_outputs',
                    'last_verification_report.document.expiration_date',
                    'last_verification_report.document.number',
                    'last_verification_report.id_number.id_number',
                ],
            },
        );
        // console.log(JSON.stringify(verificationSession));
        storeStripeIdentityVerificationResult(verificationSession);
    } else {
        console.log(stripeEvent.type);
        // console.log(stripeEvent.)
    }

    return JSON.stringify({  });
});

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

    // also update user onboarding status
    const userOnboardingStatus = await getUserOnboardingStatus(userId!);
    const newStatusDetail = editStatusDetail(userOnboardingStatus.statusDetail, "id_submitted");
    await updateUserOnboardingStatus(userId!, userOnboardingStatus.status, newStatusDetail);
}

const storeStripeIdentityVerificationResult = async(verificationSession: Stripe.Identity.VerificationSession) => {
    const verificationReport = verificationSession.last_verification_report as Stripe.Identity.VerificationReport;
    const putStripeIdentityVerificationSessionParams = {
        TableName: Table.StripeIdentityVerificationSessions.tableName,
        Item: {
            userId: verificationReport.client_reference_id,
            sessionId: verificationSession.id,
            results: verificationReport,
        },
    };
    await dynamoDb.put(putStripeIdentityVerificationSessionParams);

    // also update user onboarding status
    const userOnboardingStatus = await getUserOnboardingStatus(verificationReport.client_reference_id!);
    const newStatusDetail = editStatusDetail(userOnboardingStatus.statusDetail, "id_submitted");
    await updateUserOnboardingStatus(verificationReport.client_reference_id!, userOnboardingStatus.status, newStatusDetail);
}