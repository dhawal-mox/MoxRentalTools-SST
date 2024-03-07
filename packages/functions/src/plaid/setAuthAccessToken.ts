import handler from "@mox-rental-tools-vanilla/core/handler";
import getPlaidClient from "./getPlaidClient";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body || "{}");
    const user = data.user;
    const publicToken = data.publicToken;
    const plaidClient = getPlaidClient(Config.PLAID_CLIENT_ID, Config.PLAID_CLIENT_SECRET);

    const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
    });
    console.log(`successfully swapped public token for access token. Plaid requestId=${response.data.request_id}`);
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    const params = {
        TableName: Table.PlaidAuthItemIds.tableName,
        Item: {
            userId: user.userId,
            itemId: itemId,
            accessToken: accessToken,
        },
    };
    dynamodb.put(params);
    return JSON.stringify({});
});