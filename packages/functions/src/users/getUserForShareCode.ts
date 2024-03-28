import handler from "@mox-rental-tools-vanilla/core/handler";
import { getUserIdForShareCode } from "src/util/shareCode";
import verifyRequestUser from "src/verifyRequestUser";
import { getUser } from "./getUser";
import { getStripeIDVerificationResult } from "src/stripe/getIdVerificationResult";
import { NonTenantProfile } from "src/util/userAccountsTypes";
import { getLicenseInfo } from "src/agent/licenseInfo";

export const main = handler(async (event) => {

    verifyRequestUser(event);
    const data = JSON.parse(event.body || "");
    const shareCode = data.shareCode;
    const userId = await getUserIdForShareCode(shareCode);
    if(userId == ""){
        return "";
    }
    const user = await getUser(userId);
    const idVerificationReport = await getStripeIDVerificationResult(userId);
    let userProfile: NonTenantProfile = {
        user: user,
        id: {
            name: `${idVerificationReport.document?.first_name} ${idVerificationReport.document?.last_name}`,
            selfieVerified: idVerificationReport.selfie?.status == "verified",
            documentVerified: idVerificationReport.document?.status == "verified",
        },
    };
    if(user.userRole == "agent") {
        // add license info
        const licenseInfo = await getLicenseInfo(userId);
        if(licenseInfo) {
            userProfile.license = {
                licenseNumber: licenseInfo.licenseNumber,
                stateOfLicensure: licenseInfo.stateOfLicensure,
                typeOfLicense: licenseInfo.typeOfLicense,
                isLicenseRequired: licenseInfo.isLicenseRequired,
                verified: licenseInfo.verified,
            };
        }
    }
    return JSON.stringify({
        userProfile: userProfile,
    });
});