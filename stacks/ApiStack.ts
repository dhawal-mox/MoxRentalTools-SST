import { Api, Config, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const { usersTable, userIdentityTable } = use(StorageStack);
  const STRIPE_SECRET_KEY = new Config.Secret(stack, "STRIPE_SECRET_KEY");
  const STRIPE_PUBLISHABLE_KEY = new Config.Secret(stack, "STRIPE_PUBLISHABLE_KEY"); 

  // Create the API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [usersTable,
              userIdentityTable,
              STRIPE_PUBLISHABLE_KEY,
              STRIPE_SECRET_KEY
              ],
      },
      authorizer: "iam",
    },
    routes: {
      "POST /users": "packages/functions/src/users/createUser.main",
      "GET /users/{id}": "packages/functions/src/users/getUser.main",
      "GET /users/user": "packages/functions/src/users/getCurrentUser.main",
      "POST /users/{id}/role": "packages/functions/src/users/updateUserRole.main",
      "POST /plaid/institutions": "packages/functions/src/plaid/getPlaidInstitutions.main",
      "POST /stripe/createPaymentIntent": "packages/functions/src/stripe/createPaymentIntent.main",
      "POST /stripe/createCheckoutSession": "packages/functions/src/stripe/createCheckoutSession.main"
    },
  });

  // Show the API endpoint in the output
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  // Return the API resource
  return {
    api,
  };
}