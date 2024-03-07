import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Table } from "sst/node/table";

export default async function verifyRequestUser(event: APIGatewayProxyEvent) {
    const user = JSON.parse(event.body || "{}").user;
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
    if (result.Item.userId != user.userId) {
        throw new Error("Invalid user.");
    }
    return true;
}