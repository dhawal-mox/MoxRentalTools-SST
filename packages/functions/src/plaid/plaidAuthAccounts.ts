import dynamodb from "@mox-rental-tools-vanilla/core/dynamodb";
import { Table } from "sst/node/table";
import getPlaidClient from "./getPlaidClient";
import { Config } from "sst/node/config";
import { CountryCode } from "plaid";

export async function getPlaidAuthAccounts(user: any) {
    const userId = user.userId;
    // get accountIds from DB if available
    const getPlaidAuthAccountIdsParams = {
        TableName: Table.PlaidAuthAccountIds.tableName,
        Key: {
            userId: userId,
        },
    };

    const getPlaidAuthAccountIdsResult = await dynamodb.get(getPlaidAuthAccountIdsParams);

    if(!getPlaidAuthAccountIdsResult.Item) {
        console.info(`No accountIds found for userId ${userId}. Fetching from Plaid now.`);
        const { accounts, authItemDetails } = await fetchPlaidAuthAccounts(user);
        const institutionName = authItemDetails.institutionName;
        const institutionId = authItemDetails.institutionId;
        return { accounts, institutionName, institutionId };
    } else {
        console.info(`Found accountIds for userId ${userId}.`);
        const accountIds = getPlaidAuthAccountIdsResult.Item.accountIds;
        const {accounts, institutionName, institutionId} = await getPlaidAuthAccountsFromDB(user, accountIds);
        return { accounts, institutionName, institutionId };
    }
}

async function getPlaidAuthAccountsFromDB(user: any, accountIds: [string]) {
    let accounts: any[] = [];
    for(const accountId of accountIds) {
        const getPlaidAuthAccountParams = {
            TableName: Table.PlaidAuthAccounts.tableName,
            Key: {
                accountId: accountId,
            },
        };
        const account = (await dynamodb.get(getPlaidAuthAccountParams)).Item;
        accounts.push(account);
    }
    if(accounts.length < accountIds.length) {
        if(accounts.length == 0) {
            throw "No accounts found in DB.";
        } else {
            throw "One or more accounts not found in DB.";
        }
    }

    // also fetch institution name and id from table {plaidAuthItemDetails}
    const itemId = accounts.at(0).itemId;
    const getAuthItemDetailsParams = {
        TableName: Table.PlaidAuthItemDetails.tableName,
        Key: {
            itemId: itemId,
        },
    };
    const authItemDetails = (await dynamodb.get(getAuthItemDetailsParams)).Item;
    const institutionName = authItemDetails!.institutionName;
    const institutionId = authItemDetails!.institutionId;

    return {accounts, institutionName, institutionId};
}

async function fetchPlaidAuthAccounts(user: any) {
    const userId = user.userId;
    let accounts: any[] = [];
    // get the access token from link session
    const getPlaidAuthAccessTokenParams = {
        TableName: Table.PlaidAuthItemIds.tableName,
        Key: {
            userId: userId,
        },
    };

    const getPlaidAuthAccessTokenResult = await dynamodb.get(getPlaidAuthAccessTokenParams);
    if(!getPlaidAuthAccessTokenResult.Item) {
        throw "No access token found.";
    }
    const accessToken = getPlaidAuthAccessTokenResult.Item.accessToken;

    // fetch auth data from Plaid /auth/get
    const plaidClient = getPlaidClient(Config.PLAID_CLIENT_ID, Config.PLAID_CLIENT_SECRET);
    const plaidAuthGetRequest = {
        access_token: accessToken,
    };
    const plaidAuthGetResponse = await plaidClient.authGet(plaidAuthGetRequest);

    // insert accounts into table {plaidAuthAccounts} and {plaidAuthAccountIds}
    const plaidAccounts = plaidAuthGetResponse.data.accounts;
    const plaidAccountIds = plaidAccounts.map(plaidAccount => {
        return plaidAccount.account_id;
    });
    const itemId = plaidAuthGetResponse.data.item.item_id;

    const putPlaidAccountIdsParams = {
        TableName: Table.PlaidAuthAccountIds.tableName,
        Item: {
            userId: userId,
            accountIds: plaidAccountIds,
        },
    };
    await dynamodb.put(putPlaidAccountIdsParams);

    plaidAccounts.map(account => {
        const putPlaidAccountsParams = {
            TableName: Table.PlaidAuthAccounts.tableName,
            Item: {
                itemId: itemId,
                accountId: account.account_id,
                availableBalance: account.balances.available,
                currentBalance: account.balances.current,
                isoCurrencyCode: account.balances.iso_currency_code,
                mask: account.mask,
                officialName: account.official_name,
                name: account.name,
                type: account.type, 
                subtype: account.subtype,
                varificationStatus: account.verification_status,
            },
        };
        accounts.push(putPlaidAccountsParams.Item);
        dynamodb.put(putPlaidAccountsParams);
    });

    // insert auth item details into table {plaidAuthItemDetails}
    const plaidItemDetails = plaidAuthGetResponse.data.item;
    const plaidRequestId = plaidAuthGetResponse.data.request_id;
    const institutionId = plaidItemDetails.institution_id!;
    const getPlaidInstitutionsResponse = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
    });
    const institutionName = getPlaidInstitutionsResponse.data.institution.name;

    const putPlaidAuthItemDetailsParams = {
        TableName: Table.PlaidAuthItemDetails.tableName,
        Item: {
            itemId: itemId,
            availableProducts: plaidItemDetails.available_products || [], 
            billedProducts: plaidItemDetails.billed_products || [], 
            products: plaidItemDetails.products || [], 
            institutionId: institutionId,
            institutionName: institutionName, 
            webhookUrl: plaidItemDetails.webhook,
            error: plaidItemDetails.error || "",
            consentExpirationTime: plaidItemDetails.consent_expiration_time,
            requestId: plaidRequestId,
        },
    };
    const authItemDetails = putPlaidAuthItemDetailsParams.Item
    await dynamodb.put(putPlaidAuthItemDetailsParams);

    return { accounts, authItemDetails};
}