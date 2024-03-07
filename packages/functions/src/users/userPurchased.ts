import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { Table } from "sst/node/table";

// returns the expiration date of a user's purchase.
// 30 days for tenants. 1 year for landlords/agents.
export const main = handler(async (event) => {
    verifyRequestUser(event);
    const userId = JSON.parse(event.body != null ? event.body : "").user.userId;
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