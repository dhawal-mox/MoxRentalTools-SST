import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import { Table } from "sst/node/table";

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
        idVerificationResult = result.Item.results;
    }
    return idVerificationResult;
}