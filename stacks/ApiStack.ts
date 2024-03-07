import { Api, Config, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const { usersTable,
    userIdentityTable, stripeCheckoutSessions, 
    plaidUserRecords, plaidPayrollItemIds, plaidAuthItemIds } = use(StorageStack);
  const STRIPE_SECRET_KEY = new Config.Secret(stack, "STRIPE_SECRET_KEY");
  const STRIPE_PUBLISHABLE_KEY = new Config.Secret(stack, "STRIPE_PUBLISHABLE_KEY"); 
  const PLAID_CLIENT_ID = new Config.Secret(stack, "PLAID_CLIENT_ID");
  const PLAID_CLIENT_SECRET = new Config.Secret(stack, "PLAID_CLIENT_SECRET");

  // Create the API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [usersTable, userIdentityTable,
              stripeCheckoutSessions,
              plaidUserRecords, plaidPayrollItemIds, plaidAuthItemIds,
              STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY,
              PLAID_CLIENT_ID, PLAID_CLIENT_SECRET,
              ],
      },
      authorizer: "iam",
    },
    routes: {
      "POST /users": "packages/functions/src/users/createUser.main",
      "GET /users/{id}": "packages/functions/src/users/getUser.main",
      "GET /users/user": "packages/functions/src/users/getCurrentUser.main",
      "POST /users/{id}/role": "packages/functions/src/users/updateUserRole.main",
      "POST /users/purchased": "packages/functions/src/users/userPurchased.main",

      "POST /plaid/institutions": "packages/functions/src/plaid/getPlaidInstitutions.main",
      "POST /plaid/createLinkToken": "packages/functions/src/plaid/createPlaidLinkToken.main",
      "POST /plaid/setAuthAccessToken": "packages/functions/src/plaid/setAuthAccessToken.main",

      "POST /stripe/createCheckoutSession": "packages/functions/src/stripe/createCheckoutSession.main",
      "GET /stripe/publishableKey": "packages/functions/src/stripe/getPublishableKey.main",
      "POST /stripe/createVerificationSession": "packages/functions/src/stripe/createVerificationSession.main",
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  // Return the API resource
  return {
    api,
    STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY,
    PLAID_CLIENT_ID,
    PLAID_CLIENT_SECRET,
  };
}