import { Api, Config, StackContext, use } from "sst/constructs";
import { StorageStack } from "./StorageStack";

export function ApiStack({ stack }: StackContext) {
  const { usersTable, userIdentityTable, userOnboardingStatusTable, agentLicenseInfo,
    stripeCheckoutSessions, stripeIdentityVerificationSessions,
    plaidUserRecords, plaidPayrollItemIds, plaidPayrollItemDetails, plaidPayrollAccounts,
    plaidPayStubsForAccounts, plaidPayrollW2sForAccounts,
    plaidAuthItemIds, plaidAuthItemDetails, plaidAuthAccounts, plaidAuthAccountIds,
    bucket } = use(StorageStack);
  const STRIPE_SECRET_KEY = new Config.Secret(stack, "STRIPE_SECRET_KEY");
  const STRIPE_PUBLISHABLE_KEY = new Config.Secret(stack, "STRIPE_PUBLISHABLE_KEY"); 
  const STRIPE_WEBHOOK_SECRET = new Config.Secret(stack, "STRIPE_WEBHOOK_SECRET");
  const STRIPE_RESTRICTED_KEY = new Config.Secret(stack, "STRIPE_RESTRICTED_KEY");
  const PLAID_CLIENT_ID = new Config.Secret(stack, "PLAID_CLIENT_ID");
  const PLAID_CLIENT_SECRET = new Config.Secret(stack, "PLAID_CLIENT_SECRET");

  // Create the API
  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        bind: [usersTable, userIdentityTable, userOnboardingStatusTable, agentLicenseInfo,
              stripeCheckoutSessions, stripeIdentityVerificationSessions,
              plaidUserRecords, plaidPayrollItemIds, plaidPayrollItemDetails, plaidPayrollAccounts,
              plaidPayStubsForAccounts, plaidPayrollW2sForAccounts,
              plaidAuthItemIds, plaidAuthItemDetails, plaidAuthAccounts, plaidAuthAccountIds,
              STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_RESTRICTED_KEY,
              PLAID_CLIENT_ID, PLAID_CLIENT_SECRET,
              bucket,
              ],
      },
      authorizer: "iam",
    },
    routes: {
      "POST /users": "packages/functions/src/users/createUser.main",
      "GET /users/{id}": "packages/functions/src/users/getUser.main",
      "GET /users/user": "packages/functions/src/users/getCurrentUser.main",
      "POST /users/role": "packages/functions/src/users/updateUserRole.main",
      "POST /users/purchased": "packages/functions/src/users/userPurchased.main",
      "POST /users/tenantProfile": "packages/functions/src/users/getAccounts.main",
      "POST /users/getUserOnboardingStatus": "packages/functions/src/users/getUserOnboardingStatus.main",
      "POST /users/userConfirmedPayrollAndBankSupported": "packages/functions/src/users/userConfirmedPayrollAndBankSupported.main",
      "POST /users/userSuccessfullyPurchased": "packages/functions/src/users/userSuccessfullyPurchased.main",
      "POST /users/userSuccessfullySubmittedId": "packages/functions/src/users/userSuccessfullySubmittedId.main",
      "POST /users/userSuccessfullyConnectedPlaidAuth": "packages/functions/src/users/userSuccessfullyConnectedPlaidAuth.main",
      "POST /users/userSuccessfullyConnectedPlaidPayroll": "packages/functions/src/users/userSuccessfullyConnectedPlaidPayroll.main",
      "POST /users/getDocumentLink": "packages/functions/src/users/getDocumentLink.main",

      "POST /agent/submitLicenseInfo": "packages/functions/src/agent/submitLicenseInfo.main",

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
    STRIPE_WEBHOOK_SECRET,
    STRIPE_RESTRICTED_KEY,
    PLAID_CLIENT_ID,
    PLAID_CLIENT_SECRET,
  };
}