import handler from "@mox-rental-tools-vanilla/core/handler";
// import NodeCache from "node-cache";
// import { verifyWebhook } from "./webhookVerification";
import getPlaidClient from "./getPlaidClient";
import { Config } from "sst/node/config";

// const KEY_CACHE = new NodeCache();

export const main = handler(async (event) => {
    const plaidClient = getPlaidClient(Config.PLAID_CLIENT_ID, Config.PLAID_CLIENT_SECRET);
    const data = JSON.parse(event.body || "{}");
    const body = event.body;
    const headers = event.headers;
    // if(await verifyWebhook(body, headers, KEY_CACHE, plaidClient)) {
        if (true) {
        const product = data.webhook_type;
        const code = data.webhook_code;
        // if(product === 'INCOME' && code === 'INCOME_VERIFICATION') {
        //     const verification
        // }
        console.log(`received plaid webhook with data: ${data}`);
    } else {
        console.log(`failed to verify webhook.`);
    }
    return JSON.stringify({});
});