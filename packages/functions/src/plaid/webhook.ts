import handler from "@mox-rental-tools-vanilla/core/handler";
import { verifyWebhook } from "./verifyWebhook";
import { Config } from "sst/node/config";
import getPlaidClient from "./getPlaidClient";
import { Table } from "sst/node/table";
import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";

export const main = handler(async (event) => {
    
    const plaidClient = getPlaidClient(Config.PLAID_CLIENT_ID, Config.PLAID_CLIENT_SECRET);
    const verificationResult = await verifyWebhook(plaidClient, event.headers, event.body!);
    console.log(`verified webhook. result: ${verificationResult}`); 

    if (!verificationResult) {
        throw "Could not verify webhook.";
    }

    const data = JSON.parse(event.body || "{}");
    const product = data.webhook_type;
    const code = data.webhook_code;

    if(product === 'INCOME' && code === 'INCOME_VERIFICATION') {
        handlePayrollWebhook(data);
    }   

    return JSON.stringify({});
});

function handlePayrollWebhook(webhookData: any) {
    const verificationStatus = webhookData.verification_status;
    const webhookUserId = webhookData.user_id;
    if (verificationStatus === "VERIFICATION_STATUS_PROCESSING_COMPLETE") {
        console.log(
          `Plaid has successfully completed payroll processing for the user with the webhook identifier of ${webhookUserId}. You should probably call /paystubs/get to refresh your data.`
        );
        // insert itemId into table plaidPayrollItemId. 
        // This is not really needed because /payroll/get does not require itemId but we can use this for checking if payroll connection was successful. 
        const params = {
            TableName: Table.PlaidPayrollItemIds.tableName,
            Item: {
                webhookUserId: webhookUserId,
                itemId: webhookData.item_id,
            },
        };
        dynamodb.put(params);
    } else if (verificationStatus === "VERIFICATION_STATUS_PROCESSING_FAILED") {
        console.error(
          `Plaid had trouble processing documents for the user with the webhook identifier of ${webhookUserId}. You should ask them to try again.`
        );
    }
}