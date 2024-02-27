import * as uuid from "uuid";
import { Table } from "sst/node/table";
import handler from "@mox-rental-tools-vanilla/core/handler";
import dynamoDb from "@mox-rental-tools-vanilla/core/dynamodb";

export const main = handler(async (event) => {
  let data = {
    first_name: "",
    last_name: "",
    email: "",
  };

  if (event.body != null) {
    data = JSON.parse(event.body);
  }

  const params = {
    TableName: Table.Users.tableName,
    Item: {
      // The attributes of the item to be created
      userId: uuid.v1(), // The id of the author
      identityId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      createdAt: Date.now(), // Current Unix timestamp
      role: "",
    },
  };

  await dynamoDb.put(params);

  const userIdentityParams = {
    TableName: Table.UserIdentities.tableName,
    Item: {
      userId: params.Item.userId,
      identityId: params.Item.identityId,
    },
  };

  await dynamoDb.put(userIdentityParams);

  delete params.Item.identityId;
  return JSON.stringify(params.Item);
});