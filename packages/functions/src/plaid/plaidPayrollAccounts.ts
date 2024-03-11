import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import s3client from "@mox-rental-tools-vanilla/core/s3client";
import { Config } from "sst/node/config";
import { Table } from "sst/node/table";
import { Bucket } from "sst/node/bucket";
import getPlaidClient from "./getPlaidClient";
import { PlaidApi } from "plaid";
import fetch from "node-fetch";
import { Readable } from "stream";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function getPlaidPayrollAccounts(userId: string) {
    // making use of /plaid/credit/payroll_income/get
    const plaidClient = getPlaidClient(Config.PLAID_CLIENT_ID, Config.PLAID_CLIENT_SECRET);
    // get userToken from table {plaidUserRecords}
    const getPlaidUserRecordsParams = {
        TableName: Table.PlaidUserRecords.tableName,
        Key: {
            userId: userId,
        },
    };
    const getPlaidUserRecordsResult = await dynamodb.get(getPlaidUserRecordsParams);
    if(!getPlaidUserRecordsResult.Item) {
        throw `No user records found for userId=${userId}`;
    }
    const plaidUserRecord = getPlaidUserRecordsResult.Item;
    // logJSON("found user record", plaidUserRecord);
    if(!plaidUserRecord.incomeConnected) {
        // getPlaidPayrollAccountsFromDB
        const result = getPlaidPayrollAccountsFromDB(userId, plaidClient);
        return result;
    } else {
        // income is linked but not yet connected
        // fetchPlaidPayrollAccounts from plaid
        const result = fetchPlaidPayrollAccounts(userId, plaidClient, plaidUserRecord);
        return result;
    }

    return {};
}

function logJSON(s: string, ob: any){
    console.log(`${s}. ${JSON.stringify(ob)}`);
}

async function getPlaidPayrollAccountsFromDB(userId: string, plaidClient: PlaidApi) {
    // payrollItem
    const getPlaidPayrollItemDetailsParams = {
        TableName: Table.PlaidPayrollItemDetails.tableName,
        Key: {
            userId: userId,
        },
    };
    const getPlaidPayrollItemDetailsResult = await dynamodb.get(getPlaidPayrollItemDetailsParams);
    const payrollItem = getPlaidPayrollItemDetailsResult.Item!;

    const payrollItemId = payrollItem.itemId;

    // payrollAccounts
    const getPayrollAccountsParams = {
        TableName: Table.PlaidPayrollAccounts.tableName,
        KeyConditionExpression: "payrollItemId = :payrollItemId",
        ExpressionAttributeValues: {
            ":payrollItemId": payrollItemId,
        },
    };
    const getPayrollAccountsResult = await dynamodb.query(getPayrollAccountsParams);
    const payrollAccounts = getPayrollAccountsResult.Items!;

    // payStubsForAccounts
    let payStubsForAccounts: any[] = [];
    // taxW2ForAccounts
    let taxW2ForAccounts: any[] = [];

    for(const account of payrollAccounts) {
        const getPayStubsForAccountsParams = {
            TableName: Table.PlaidPayStubsForAccounts.tableName,
            KeyConditionExpression: "accountId = :accountId",
            ExpressionAttributeValues: {
                ":accountId": account.accountId,
            },
        };
        const getPayStubsForAccountsResult = await dynamodb.query(getPayStubsForAccountsParams);
        payStubsForAccounts = payStubsForAccounts.concat(getPayStubsForAccountsResult.Items!);

        const getTaxW2ForAccountParams = {
            TableName: Table.PlaidPayrollW2sForAccounts.tableName,
            KeyConditionExpression: "accountId = :accountId",
            ExpressionAttributeValues: {
                ":accountId": account.accountId,
            },
        };
        const getTaxW2ForAccountResult = await dynamodb.query(getPayStubsForAccountsParams);
        taxW2ForAccounts = taxW2ForAccounts.concat(getPayStubsForAccountsResult.Items!);
    }

    return { payrollItem, payrollAccounts, payStubsForAccounts, taxW2ForAccounts };

    
}

async function fetchPlaidPayrollAccounts(userId: string, plaidClient: PlaidApi, plaidUserRecord: any) {
    const userToken = plaidUserRecord.userToken;
    const creditPayrollIncomeGetResponse = await plaidClient.creditPayrollIncomeGet({
        user_token: userToken,
    });
    // we're expecting just one payroll item
    const plaidPayrollItem = creditPayrollIncomeGetResponse.data.items[0];

    // insert payrollItem details into table {plaidPayrollItems}
    const putPlaidPayrollItemDetailsParams = {
        TableName: Table.PlaidPayrollItemDetails.tableName,
        Item: {
            userId: userId,
            itemId: plaidPayrollItem.item_id === "" ? "empty" : plaidPayrollItem.item_id,
            institutionId: plaidPayrollItem.institution_id,
            institutionName: plaidPayrollItem.institution_name,
            updatedAt: plaidPayrollItem.updated_at,
        },
    };
    await dynamodb.put(putPlaidPayrollItemDetailsParams);

    // we will use this as one of our return values.
    const payrollItem = putPlaidPayrollItemDetailsParams.Item;

    // 1. insert all payroll accounts into table {plaidPayrollAccounts}
    // also insert all W2 employers for each account

    // 2. insert w2 details for each account into table {plaidPayrollAccountW2s}
    let taxW2ForAccounts: any[] = [];
    let employerNamesW2: any[] = [];
    let payrollAccounts: any[] = [];
    let payStubsForAccounts: any[] = [];
    let imagesToFetch: Map<string,string> = new Map();
 
    for(const payroll of plaidPayrollItem.payroll_income) {

        const accountId = payroll.account_id!;
        if(payroll.w2s) {
            // w2 payroll
            // taxW2ForAccountId.set(accountId, payroll.w2s);
            for(const w2Data of payroll.w2s){
                employerNamesW2.push(w2Data.employer.name);
                // fetch all w2 pdfs and replace the document link with s3 link
                const putPlaidPayrollW2sForAccountParams = {
                    TableName: Table.PlaidPayrollW2sForAccounts.tableName,
                    Item: {
                        accountId: accountId,
                        documentId: w2Data.document_id,
                        documentUrl: w2Data.document_metadata.download_url,
                        data: w2Data,
                    },
                };
                await dynamodb.put(putPlaidPayrollW2sForAccountParams);
                taxW2ForAccounts.push(putPlaidPayrollW2sForAccountParams.Item);
                imagesToFetch.set(w2Data.document_id, w2Data.document_metadata.download_url!);
            }
        }
    }

    for(const payrollAccount of plaidPayrollItem.accounts) {
        const putPlaidPayrollAccountParams = {
            TableName: Table.PlaidPayrollAccounts.tableName,
            Item: {
                payrollItemId: plaidPayrollItem.item_id,
                accountId: payrollAccount.account_id,
                payAmount: payrollAccount.rate_of_pay.pay_amount,
                payRate: payrollAccount.rate_of_pay.pay_rate,
                payFrequency: payrollAccount.pay_frequency,
                employerNamesW2: employerNamesW2,
            },
        }
        await dynamodb.put(putPlaidPayrollAccountParams);
        payrollAccounts.push(putPlaidPayrollAccountParams.Item);
    }

    // 3. insert all paystubs into table {plaidPayStubsForAccounts}
    for(const payrollIncome of plaidPayrollItem.payroll_income){
        const accountId = payrollIncome.account_id!;
        for(const payStub of payrollIncome.pay_stubs) {
            const putPlaidPayStubsForAccountsParams = {
                TableName: Table.PlaidPayStubsForAccounts.tableName,
                Item: {
                    accountId: accountId,
                    documentId: payStub.document_id,
                    documentUrl: payStub.document_metadata.download_url,
                    data: payStub,
                },
            };
            await dynamodb.put(putPlaidPayStubsForAccountsParams);
            payStubsForAccounts.push(putPlaidPayStubsForAccountsParams.Item);
            imagesToFetch.set(payStub.document_id!, payStub.document_metadata.download_url!);
        }
    }

    // Function to convert a Buffer into a ReadableStream
    function bufferToStream(buffer: Buffer): Readable {
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null); // Signifies the end of the stream
        return stream;
    }

    // download all images and upload to s3 bucket
    for(let [document_id, document_url] of imagesToFetch) {

        if(document_url == "") {
            continue;
        }
        const downloadResponse = await fetch(document_url);
        if(!downloadResponse.ok) {
            throw `Failed to fetch image ${downloadResponse.statusText}`;
        }
        const buffer = Buffer.from(await downloadResponse.arrayBuffer());

        const uploadToBucketCommand = new PutObjectCommand({
            Bucket: Bucket.Uploads.bucketName,
            Key: document_id,
            Body: bufferToStream(buffer),
            ContentType: "pdf",
        });
        await s3client.put(uploadToBucketCommand);
    }

    // update user records to show income connected
    const updatePlaidUserRecordsParams = {
        TableName: Table.PlaidUserRecords.tableName,
        Key: {
            userId: userId,
        },
        UpdateExpression: "SET incomeConnected = :incomeConnected",
        ExpressionAttributeValues: {
            ":incomeConnected": true,
        },
    };
    await dynamodb.update(updatePlaidUserRecordsParams);

    return {payrollItem, payrollAccounts, payStubsForAccounts, taxW2ForAccounts};
    
}