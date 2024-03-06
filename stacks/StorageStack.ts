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
    primaryIndex: { partitionKey: "userId" }
  })

  // Plaid user access tokens - when creating link token
  const plaidUserRecords = new Table(stack, "PlaidUserRecords", {
    fields: {
      accessToken: "string",
      userToken: "string",
      // incomeConnected: "boolean",
      plaidWebhookUserId: "string",
      userId: "string",
    },
    primaryIndex: { partitionKey: "userId" }
  })

  // Plaid: ItemId returned when Plaid Payroll is successfully linked for a user. Obtained from webhook.
  const plaidPayrollItemIds = new Table(stack, "PlaidPayrollItemIds", {
    fields: {
      webhookUserId: "string",
      itemId: "string",
    },
    primaryIndex: { partitionKey: "webhookUserId" }
  })

  // Create an S3 bucket
  const bucket = new Bucket(stack, "Uploads");

  return {
    usersTable,
    userIdentityTable,
    stripeCheckoutSessions,
    plaidUserRecords,
    plaidPayrollItemIds,
    bucket,
  };
}