import handler from "@mox-rental-tools-vanilla/core/handler";
import { Config } from "sst/node/config";


export const main = handler(async (event) => {
    return JSON.stringify({stripePublishableKey: Config.STRIPE_PUBLISHABLE_KEY});
});