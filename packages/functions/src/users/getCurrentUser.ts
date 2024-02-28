import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import handler from "@mox-rental-tools-vanilla/core/handler";
import { Table } from "sst/node/table";


export const main = handler(async (event) => {
    const params = {
        TableName: Table.UserIdentities.tableName,
        Key: {
            identityId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
        },
    };

    const result = await dynamodb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }
    const userId = result.Item.userId;

    const userTableParams = {
        TableName: Table.Users.tableName,
        Key: {
            userId: userId,
        },
    };

    const userResult = await dynamodb.get(userTableParams);
    if (!userResult.Item) {
        throw new Error("Item not found.");
    }
    
    // Return the retreived item
    delete userResult.Item?.identityId;
    return JSON.stringify(userResult.Item);
});