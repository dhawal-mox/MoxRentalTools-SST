import handler from "@mox-rental-tools-vanilla/core/handler";
import { getPlaidAuthAccounts } from "src/plaid/plaidAuthAccounts";

export const main = handler(async (event) => {
    const accounts = getPlaidAuthAccounts(event);
    return JSON.stringify(accounts);
});