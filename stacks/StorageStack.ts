import { Bucket, StackContext, Table } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  // Create the DynamoDB table
  const usersTable = new Table(stack, "Users", {
    fields: {
      identityId: "string",
      userId: "string",
      first_name: "string",
      last_name: "string",
      email: "string",
      userRole: "string",
    },
    primaryIndex: { partitionKey: "userId" },
  });

  const userIdentityTable = new Table(stack, "UserIdentities", {
    fields: {
      identityId: "string",
      userId: "string",
    },
    primaryIndex: { partitionKey: "identityId" },
  });

  const stripeCheckoutSessions = new Table(stack, "StripePurchases", {
    fields: {
      userId: "string",
      timestamp: "number",
      customerEmail: "string",
      priceId: "string",
      sessionId: "string",
      userRole: "string",
      expiration: "number",
    },
    primaryIndex: { partitionKey: "userId" },
  });

  // Plaid user access tokens - when creating link token
  const plaidUserRecords = new Table(stack, "PlaidUserRecords", {
    fields: {
      accessToken: "string",
      userToken: "string",
      // incomeConnected: "boolean",
      plaidWebhookUserId: "string",
      userId: "string",
    },
    primaryIndex: { partitionKey: "userId" },
  });

  // Plaid: ItemId returned when Plaid Payroll is successfully linked for a user. Obtained from webhook.
  const plaidPayrollItemIds = new Table(stack, "PlaidPayrollItemIds", {
    fields: {
      webhookUserId: "string",
      itemId: "string",
    },
    primaryIndex: { partitionKey: "webhookUserId" },
  });

  // Plaid: itemId and accessToken returned Plaid Auth is successfully linked for a user. Obtained from setAccessToken (public token swap)
  const plaidAuthItemIds = new Table(stack, "PlaidAuthItemIds", {
    fields: {
      userId: "string",
      itemId: "string",
      accessToken: "string",
    },
    primaryIndex: { partitionKey: "userId" },
  });

  // Plaid: item details. Data from the "item" part of the response from /plaid/auth/get call.
  // https://plaid.com/docs/api/products/auth/#authget
  const plaidAuthItemDetails = new Table(stack, "PlaidAuthItemDetails", {
    fields: {
      itemId: "string",
      availableProducts: "string", // [string] value
      billedProducts: "string", // [string] value
      products: "string", // [string] value
      institutionId: "string",
      institutionName: "string", // fetched from /plaid/institutions/get_by_id
      webhookUrl: "string",
      error: "string",
      consentExpirationTime: "string",
      requestId: "string",
    },
    primaryIndex: { partitionKey: "itemId" },
  });

  // Plaid: account details. Data from the "accounts" part of the response from /plaid/auth/get call.
  // https://plaid.com/docs/api/products/auth/#authget
  const plaidAuthAccounts = new Table(stack, "PlaidAuthAccounts", {
    fields: {
      itemId: "string",
      accountId: "string",
      availableBalance: "string",
      currentBalance: "string",
      isoCurrencyCode: "string",
      mask: "string",
      officialName: "string",
      name: "string",
      type: "string", // https://plaid.com/docs/api/accounts/#account-type-schema
      subtype: "string",
      varificationStatus: "string",
    },
    primaryIndex: { partitionKey: "accountId" },
  });

  // Plaid: accountIds for a user. Data from the "accounts" part of the response from /plaid/auth/get call.
  // https://plaid.com/docs/api/products/auth/#authget
  const plaidAuthAccountIds = new Table(stack, "PlaidAuthAccountIds", {
    fields: {
      userId: "string",
      accountIds: "string",
    },
    primaryIndex: { partitionKey: "userId" },
  });

  // Create an S3 bucket
  const bucket = new Bucket(stack, "Uploads");

  return {
    usersTable, userIdentityTable,
    stripeCheckoutSessions,
    plaidUserRecords, plaidPayrollItemIds, plaidAuthItemIds, plaidAuthItemDetails, plaidAuthAccounts, plaidAuthAccountIds,
    bucket,
  };
}