import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import { Table } from "sst/node/table";

export async function getShareCodeForUser(userId: string) {
    const getShareCodeParams = {
        TableName: Table.ShareCodes.tableName,
        IndexName: "ownerIdIndex",
        KeyConditionExpression: "ownerId = :ownerId",
        ExpressionAttributeValues: {
            ":ownerId": userId,
        },
    };
    const result = await dynamodb.query(getShareCodeParams);
    if(!result) {
        throw "User does not have a share code.";
    }
    console.info(`getShareCodeForUser ${userId} returned ${result.Items?.length} value(s).`);
    return result.Items?.at(0);
}

export async function getUserIdForShareCode(shareCode: string) {
    const getUserForShareCodeParams = {
        TableName: Table.ShareCodes.tableName,
        Key: {
            shareCode: shareCode,
        },
    };
    const getUserForShareCodeResult = await dynamodb.get(getUserForShareCodeParams);
    if(!getUserForShareCodeResult.Item) {
        return "";
    }
    return getUserForShareCodeResult.Item!.ownerId;
}