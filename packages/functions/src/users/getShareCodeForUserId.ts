import handler from "@mox-rental-tools-vanilla/core/handler";
import { getShareCodeForUser } from "src/util/shareCode";

export const main = handler(async (event) => {
    const data = JSON.parse(event.body || "");
    const userId = data.userId;
    const shareCode = await getShareCodeForUser(userId);
    return JSON.stringify({
        shareCode: shareCode!.shareCode,
    });
});