import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import { Table } from "sst/node/table";

export async function getUserOnboardingStatus(userId: string) {
    const getUserOnboardingStatusParams = {
        TableName: Table.UserOnboardingStatus.tableName,
        Key:{
            userId: userId,
        },
    };
    const result = await dynamodb.get(getUserOnboardingStatusParams);
    if(!result.Item) {
        return {};
    }
    return result.Item;
}

export async function createUserOnboardingStatus(userId: string, status: string, statusDetail?: string){
    const createUserOnboadingStatusParams = {
        TableName: Table.UserOnboardingStatus.tableName,
        Item:{
            userId: userId,
            status: status,
            statusDetail: statusDetail ? statusDetail : "",
        },
    };
    await dynamodb.put(createUserOnboadingStatusParams);
}

export async function updateUserOnboardingStatus(userId: string, status: string, statusDetail?: string) {
    const updateUserOnboardingStatusParams = {
        TableName: Table.UserOnboardingStatus.tableName,
        Key: {
            userId: userId,
        },
        UpdateExpression: "SET #statusField = :status, statusDetail = :statusDetail",
        ExpressionAttributeValues: {
            ":status": status,
            ":statusDetail": statusDetail ? statusDetail : "",
        },
        ExpressionAttributeNames: {
            "#statusField": "status",
        },
    };
    await dynamodb.update(updateUserOnboardingStatusParams);
}

export function editStatusDetail(statusDetail: string, newDetail: string){
    return `${statusDetail}${statusDetail.length > 0 ? ',': ''}${newDetail}`;
}