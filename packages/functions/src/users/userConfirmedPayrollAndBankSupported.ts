import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { getUserOnboardingStatus, updateUserOnboardingStatus } from "./onboardingStatus";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const data = JSON.parse(event.body || "{}");
    const user = data.user;
    const userOnboardingStatus = await getUserOnboardingStatus(user.userId);
    const statusDetail = userOnboardingStatus.statusDetail;
    const newStatusDetail = `${statusDetail}${statusDetail.length > 0 ? ',': ''}plaid_payroll_bank_supported_confirmed`;
    updateUserOnboardingStatus(user.userId, "tenant_setup", newStatusDetail);
    console.info(`User ${user.userId} confirmed plaid payroll and bank account supported.`);
    return "";
});