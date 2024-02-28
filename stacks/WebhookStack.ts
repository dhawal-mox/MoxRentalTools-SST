import { Api, Config, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { ApiStack } from "./ApiStack";

export function WebhookStack({ stack }: StackContext) {
  const { usersTable, userIdentityTable, stripeCheckoutSessions } = use(StorageStack);
  const {STRIPE_SECRET_KEY} = use(ApiStack);
  const {STRIPE_PUBLISHABLE_KEY} = use(ApiStack); 

  // Create the API
  const webhook = new Api(stack, "Webhook", {
    defaults: {
      function: {
        bind: [usersTable,
              userIdentityTable,
              stripeCheckoutSessions,
              STRIPE_PUBLISHABLE_KEY,
              STRIPE_SECRET_KEY
              ],
      },
    },
    routes: {
      "POST /stripe/webhook": "packages/functions/src/stripe/webhook.main",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    WebhookEndpoint: webhook.url,
  });

  // Return the API resource
  return {
    webhook,
  };
}