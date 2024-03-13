import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { editStatusDetail, getUserOnboardingStatus, updateUserOnboardingStatus } from "./onboardingStatus";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const user = JSON.parse(event.body!).user;
    const currentStatus = await getUserOnboardingStatus(user.userId);
    const updatedStatusDetail = editStatusDetail(currentStatus.statusDetail, "id_submitted");
    updateUserOnboardingStatus(user.userId, currentStatus.status, updatedStatusDetail);
    return "";
});