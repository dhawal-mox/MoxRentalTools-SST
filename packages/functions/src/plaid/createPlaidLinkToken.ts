import handler from "@mox-rental-tools-vanilla/core/handler";
import getPlaidClient from "./getplaidClient";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";

const plaidClient = getPlaidClient(Config.PLAID_CLIENT_ID, Config.PLAID_CLIENT_SECRET);

async function fetchOrCreateUserToken(user: any) {

    const getPlaidUserRecordParams = {
        TableName: Table.PlaidUserRecords.tableName,
        Key :{
            userId: user.userId,
        },
    }
    const plaidUserRecord = await dynamoDb.get(getPlaidUserRecordParams);
    if(plaidUserRecord.Item) {
        return plaidUserRecord.Item.userToken;
    }

    const response = await plaidClient.userCreate({
        client_user_id: user.userId,
    });
    console.log(`New user token is  ${JSON.stringify(response.data)}`);

    const newUserToken = response.data.user_token;
    const userWebhookId = response.data.user_id;
    const params = {
        TableName: Table.PlaidUserRecords.tableName,
        Item: {
            userId: user.userId,
            accessToken: "",
            userToken: newUserToken,
            incomeConnected: false,
            plaidWebhookUserId: userWebhookId,
        },
    };
    
    await dynamoDb.put(params);
    return newUserToken;
}

export const main = handler(async (event) => {
    const user = JSON.parse(event.body || "{}").user;
    const userToken = await fetchOrCreateUserToken(user);
    console.log(`User token returned: ${userToken}`);
    const income_verification_object = { income_source_types: ["payroll"] };
    const webhookUrl = "";
    const basicLinkTokenObject = {
        user: { client_user_id: "testUser" },
        client_name: "Todd's Hoverboards",
        language: "en",
        products: [],
        country_codes: ["US"],
      };
    const newIncomeTokenObject = {
        ...basicLinkTokenObject,
        products: ["income_verification"],
        user_token: userToken,
        webhook: webhookUrl,
        income_verification: income_verification_object,
      };
    return JSON.stringify({});
});