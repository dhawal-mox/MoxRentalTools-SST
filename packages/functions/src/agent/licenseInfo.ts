import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import { Table } from "sst/node/table";

export async function putLicenseInfo(userId: string, licenseInfo: any) {
    
    const putAgentLicenseInfoParams= {
        TableName: Table.AgentLicenseInfo.tableName,
        Item: {
            userId: userId,
            licenseNumber: licenseInfo.licenseNumber,
            stateOfLicensure: licenseInfo.stateOfLicensure,
            typeOfLicense: licenseInfo.typeOfLicense,
            isLicenseRequired: licenseInfo.isLicenseRequired,
            verified: false,
        },
    };
    await dynamodb.put(putAgentLicenseInfoParams);
}

export async function getLicenseInfo(userId: string) {
    const getLicenseInfoParams = {
        TableName: Table.AgentLicenseInfo.tableName,
        Key: {
            userId: userId,
        },
    };
    return (await dynamodb.get(getLicenseInfoParams)).Item || null;
}

