import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import { Table } from "sst/node/table";
import Stripe from "stripe";

export async function getStripeIDVerificationResult(userId: string) {
    const getStripeIDVerificationResultParams = {
        TableName: Table.StripeIdentityVerificationSessions.tableName,
        Key: {
            userId: userId,
        },
    };
    const result = await dynamodb.get(getStripeIDVerificationResultParams);
    let idVerificationResult = {};
    if(result.Item) {
        // idVerificationResult = result.Item.results;
        return result.Item.results as Stripe.Identity.VerificationReport;
    }
    return idVerificationResult as Stripe.Identity.VerificationReport;
}