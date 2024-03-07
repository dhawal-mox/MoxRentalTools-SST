import { Table } from "sst/node/table";
import handler from "@mox-rental-tools-vanilla/core/handler";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";
import verifyRequestUser from "src/verifyRequestUser";

export const main = handler(async (event) => {
  verifyRequestUser(event);
  const data = JSON.parse(event.body || "{}");
  const user = data.user;
  console.log(`Updateing user role: userId ${user.userId} and role ${data.userRole}`);

  const params = {
    TableName: Table.Users.tableName,
    Key: {
        userId: user.userId,
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