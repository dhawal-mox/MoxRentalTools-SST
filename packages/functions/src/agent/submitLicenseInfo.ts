import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { putLicenseInfo } from "./licenseInfo";
import { editStatusDetail, getUserOnboardingStatus, updateUserOnboardingStatus } from "src/users/onboardingStatus";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const data = JSON.parse(event.body || "{}");
    await putLicenseInfo(data.user.userId, data.licenseInfo);

    // update user onboarding status
    const userOnboardingStatus = await getUserOnboardingStatus(data.user.userId);
    const newStatusDetail = editStatusDetail(userOnboardingStatus.statusDetail, "license_submitted");
    await updateUserOnboardingStatus(userOnboardingStatus.userId, userOnboardingStatus.status, newStatusDetail);
    return "";
})