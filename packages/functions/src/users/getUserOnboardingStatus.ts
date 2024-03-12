import handler from "@mox-rental-tools-vanilla/core/handler";
import verifyRequestUser from "src/verifyRequestUser";
import { getUserOnboardingStatus } from "./onboardingStatus";

export const main = handler(async (event) => {
    
    verifyRequestUser(event);
    const data = JSON.parse(event.body || "{}");
    const user = data.user;
    return JSON.stringify(await getUserOnboardingStatus(user.userId));
});