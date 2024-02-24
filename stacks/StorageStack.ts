import { Bucket, StackContext, Table } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {
  // Create the DynamoDB table
  const table = new Table(stack, "Users", {
    fields: {
      identityId: "string",
      userId: "string",
      first_name: "string",
      last_name: "string",
      email: "string",
    },
    primaryIndex: { partitionKey: "userId" },
  });
  // Create an S3 bucket
  const bucket = new Bucket(stack, "Uploads");

  return {
    table,
    bucket,
  };
}