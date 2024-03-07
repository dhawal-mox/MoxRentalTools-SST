import handler from "@mox-rental-tools-vanilla/core/handler";
import getPlaidClient from "./getPlaidClient";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";
import { use } from "sst/constructs";
import { CountryCode, IncomeVerificationPayrollFlowType, IncomeVerificationSourceType, Products, LinkTokenCreateRequest } from "plaid";

const plaidClient = getPlaidClient(Config.PLAID_CLIENT_ID, Config.PLAID_CLIENT_SECRET);
const webhookEndpoint = "https://8w7uah6pw7.execute-api.us-east-1.amazonaws.com";

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
            authAccessToken: "",
        },
    };
    
    await dynamoDb.put(params);
    return newUserToken;
}

export const main = handler(async (event) => {
    const data = JSON.parse(event.body || "{}");
    const user = data.user;
    const productType = data.productType;

    const userToken = await fetchOrCreateUserToken(user);
    console.log(`User token returned: ${userToken}`);

    const webhookUrl = `${webhookEndpoint}/plaid/webhook`;
    let linkTokenCreateRequest: LinkTokenCreateRequest;

    if(productType == "payroll") {
        linkTokenCreateRequest = {
            user: {
                client_user_id: user.userId,
                email_address: user.email,
            },
            client_name: "MOX Rental Tools",
            products: [Products.IncomeVerification],
            user_token: userToken,
            income_verification: {
                income_source_types: [IncomeVerificationSourceType.Payroll],
                payroll_income: { flow_types: [IncomeVerificationPayrollFlowType.DigitalIncome] },
            },
            language: "en",
            webhook: webhookUrl,
            country_codes: [CountryCode.Us],
        };
    } else {
        // productType == "auth"
        linkTokenCreateRequest = {
            user: {
                client_user_id: user.userId,
                email_address: user.email,
            },
            client_name: "MOX Rental Tools",
            products: [Products.Auth],
            user_token: userToken,
            language: "en",
            webhook: webhookUrl,
            country_codes: [CountryCode.Us],
            // redirect_uri: "http://localhost:5173/oauth-page",
        };
    }

    
    const createTokenResponse = await plaidClient.linkTokenCreate(linkTokenCreateRequest);
    return JSON.stringify(createTokenResponse.data);
});