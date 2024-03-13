import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { Table } from "sst/node/table";
import { editStatusDetail, getUserOnboardingStatus, updateUserOnboardingStatus } from "./onboardingStatus";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const user = JSON.parse(event.body!).user;
    const currentStatus = await getUserOnboardingStatus(user.userId);
    const updatedStatusDetail = editStatusDetail(currentStatus.statusDetail, "payment_complete");
    updateUserOnboardingStatus(user.userId, currentStatus.status, updatedStatusDetail);
    return "";
});