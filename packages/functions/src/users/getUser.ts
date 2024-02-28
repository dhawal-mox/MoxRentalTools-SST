import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import handler from "@mox-rental-tools-vanilla/core/handler";
import { Table } from "sst/node/table";


export const main = handler(async (event) => {
    const params = {
        TableName: Table.Users.tableName,
        Key: {
            userId: event.pathParameters?.id,
        },
    };

    const result = await dynamodb.get(params);
    if (!result.Item) {
        throw new Error("Item not found.");
    }

    // Return the retreived item
    delete result.Item?.identityId;
    return JSON.stringify(result.Item);
});