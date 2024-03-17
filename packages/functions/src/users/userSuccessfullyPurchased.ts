import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { editStatusDetail, getUserOnboardingStatus, updateUserOnboardingStatus } from "./onboardingStatus";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const user = JSON.parse(event.body!).user;
    const currentStatus = await getUserOnboardingStatus(user.userId);
    const updatedStatusDetail = editStatusDetail(currentStatus.statusDetail, "payment_complete");
    let newStatus = currentStatus.status;
    switch(user.userRole) {
        case "tenant":
            newStatus = currentStatus.status;
            break;
        case "agent":
            newStatus = "agent_setup";
            break;
        case "landlord":
            newStatus = "landlord_setup";
            break;
    }
    updateUserOnboardingStatus(user.userId, newStatus, updatedStatusDetail);
    return "";
});