import { Api, Config, StackContext, use, Function } from "sst/constructs";
import { StorageStack } from "./StorageStack";
import { ApiStack } from "./ApiStack";

export function WebhookStack({ stack }: StackContext) {
  const { usersTable, userIdentityTable, stripeCheckoutSessions, plaidUserRecords, plaidPayrollItemIds } = use(StorageStack);
  const {STRIPE_SECRET_KEY} = use(ApiStack);
  const {STRIPE_PUBLISHABLE_KEY} = use(ApiStack); 
  const { PLAID_CLIENT_ID, PLAID_CLIENT_SECRET } = use(ApiStack);

  // Create the API
  const webhook = new Api(stack, "Webhook", {
    defaults: {
      function: {
        bind: [usersTable,
              userIdentityTable,
              stripeCheckoutSessions,
              plaidUserRecords,
              plaidPayrollItemIds,
              STRIPE_PUBLISHABLE_KEY,
              STRIPE_SECRET_KEY,
              PLAID_CLIENT_ID,
              PLAID_CLIENT_SECRET,
              ],
      },
    },
    // authorizers: {
    //   PlaidAuthorizer: {
    //     type: "lambda",
    //     identitySource: ["$request.header.plaid-verification"],

    //     function: new Function(stack, "PlaidAuthorizer", {
    //       handler: "packages/functions/src/plaid/webhookAuthorizer.handler",
    //     })
    //   }
    // },
    routes: {
      "POST /stripe/webhook": "packages/functions/src/stripe/webhook.main",
      "POST /plaid/webhook": "packages/functions/src/plaid/webhook.main",
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