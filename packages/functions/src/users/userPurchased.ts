import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import handler from "@mox-rental-tools-vanilla/core/handler";
import { Table } from "sst/node/table";


export const main = handler(async (event) => {
    const userId = JSON.parse(event.body != null ? event.body : "").userId;
    const params = {
        TableName: Table.StripePurchases.tableName,
        Key: {
            userId: userId,
        },
        Limit: 1,
        ScanIndexForward: false,
    };

    const result = await dynamodb.get(params);
    if (!result.Item) {
        return JSON.stringify({});
    }
    
    return JSON.stringify({expiration: result.Item.expiration});
});