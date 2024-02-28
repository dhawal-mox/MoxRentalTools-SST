import { Table } from "sst/node/table";
import handler from "@mox-rental-tools-vanilla/core/handler";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";

export const main = handler(async (event) => {

  const data = JSON.parse(event.body || "{}");
  console.log(event.body);
  console.log(`Updateing user role: userId ${event.pathParameters?.id} and role ${data.userRole}`);

  const params = {
    TableName: Table.Users.tableName,
    Key: {
        userId: event.pathParameters?.id,
    },
    UpdateExpression: "SET userRole = :userRole",
    ExpressionAttributeValues: {
      ":userRole": data.userRole || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);
  return JSON.stringify({ status: true });
});