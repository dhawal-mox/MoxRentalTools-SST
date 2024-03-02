import handler from "@mox-rental-tools-vanilla/core/handler";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body || "{}");
    const product = data.webhook_type;
    const code = data.webhook_code;
    // if(product === 'INCOME' && code === 'INCOME_VERIFICATION') {
    //     const verification
    // }
    console.log(`received plaid webhook with data: ${data}`);
    return JSON.stringify({});
});