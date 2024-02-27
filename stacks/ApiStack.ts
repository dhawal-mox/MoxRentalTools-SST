import { Api, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const { usersTable, userIdentityTable } = use(StorageStack);

  // Create the API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [usersTable, userIdentityTable],
      },
      authorizer: "iam",
    },
    routes: {
      "POST /users": "packages/functions/src/createUser.main",
      "GET /users/{id}": "packages/functions/src/getUser.main",
      "GET /users/user": "packages/functions/src/getCurrentUser.main",
      "POST /users/{id}/role": "packages/functions/src/updateUserRole.main",
      "POST /plaid/institutions": "packages/functions/src/getPlaidInstitutions.main",
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