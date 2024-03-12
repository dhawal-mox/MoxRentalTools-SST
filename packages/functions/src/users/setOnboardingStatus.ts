import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { updateUserOnboardingStatus, getUserOnboardingStatus } from "./onboardingStatus";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const data = JSON.parse(event.body || "{}");
    const user = data.user;
    const status = data.status;
    const statusDetail = data.statusDetail;
    if((await getUserOnboardingStatus(user.userId)).userId) {
        updateUserOnboardingStatus(user.userId, status, statusDetail);
    }
    return "";
});