import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { editStatusDetail, getUserOnboardingStatus, updateUserOnboardingStatus } from "./onboardingStatus";
import { getPlaidAuthAccounts } from "src/plaid/plaidAuthAccounts";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const user = JSON.parse(event.body!).user;
    const currentStatus = await getUserOnboardingStatus(user.userId);
    const updatedStatusDetail = editStatusDetail(currentStatus.statusDetail, "bank_linked");
    updateUserOnboardingStatus(user.userId, currentStatus.status, updatedStatusDetail);
    await getPlaidAuthAccounts(user.userId);
    return "";
});