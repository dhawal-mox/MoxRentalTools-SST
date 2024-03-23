import { Table } from "sst/node/table";
import handler from "@mox-rental-tools-vanilla/core/handler";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";
import verifyRequestUser from "src/verifyRequestUser";
import { updateUserOnboardingStatus } from "./onboardingStatus";
import ShortUniqueId from "short-unique-id";

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

  // create share code
  const putShareCodeParams = {
    TableName: Table.ShareCodes.tableName,
    Item: {
      shareCode: `${data.userRole}-${(new ShortUniqueId({ length: 6}).rnd())}`,
      ownerId: user.userId,
      createdAt: Date.now(),
    },
  };
  await dynamoDb.put(putShareCodeParams);

  // update user onboarding status
  await updateUserOnboardingStatus(user.userId, "selected_role", "");
  
  return JSON.stringify({ status: true });
});