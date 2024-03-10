import handler from "@mox-rental-tools-vanilla/core/handler";
import { getPlaidAuthAccounts } from "src/plaid/plaidAuthAccounts";
import { getPlaidPayrollAccounts } from "src/plaid/plaidPayrollAccounts";
import verifyRequestUser from "src/verifyRequestUser";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const data = JSON.parse(event.body!);
    const user = data.user;
    const authAccounts = await getPlaidAuthAccounts(user.userId);
    const payrollAccounts = await getPlaidPayrollAccounts(user.userId);
    return JSON.stringify({
        authAccounts: authAccounts,
        payrollAccounts: payrollAccounts,
    });
});