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
    const newStatus = completedSetupSteps(status, (statusDetail ? statusDetail : "")) ? "onboarded" : status;
    console.log(`new status = ${newStatus}`);
    const updateUserOnboardingStatusParams = {
        TableName: Table.UserOnboardingStatus.tableName,
        Key: {
            userId: userId,
        },
        UpdateExpression: "SET #statusField = :status, statusDetail = :statusDetail",
        ExpressionAttributeValues: {
            ":status": newStatus,
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

const tenantSetupSteps = [
    "plaid_payroll_bank_supported_confirmed",
    "payment_complete",
    "id_submitted",
    "payroll_linked",
    "bank_linked",
];

const landlordSetupSteps = [
    "payment_complete",
    "id_submitted",
];

const agentSetupSteps = [
    "payment_complete",
    "id_submitted",
    "license_submitted",
];

function completedSetupSteps(status: string, statusDetail: string){
    let steps: string[] = [];
    switch(status) {
        case "tenant_setup":
            steps = tenantSetupSteps;
            break;
        case "landlord_setup":
            steps = landlordSetupSteps;
            break;
        case "agent_setup":
            steps = agentSetupSteps;
            break;
        default:
            return false;
    }
    const details = new Set(statusDetail.split(","));
    let completed = true;
    steps.map(step => {
        if(!details.has(step)){
            completed = false;
        }
    });
    return completed;
}