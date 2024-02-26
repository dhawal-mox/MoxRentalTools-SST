import { Table } from "sst/node/table";
import handler from "@mox-rental-tools-vanilla/core/handler";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body || "{}");

  const params = {
    TableName: Table.Users.tableName,
    Key: {
        userId: event.pathParameters?.userId,
    },
    UpdateExpression: "SET role = :role",
    ExpressionAttributeValues: {
      ":role": data.role || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);
  return JSON.stringify({ status: true });
});