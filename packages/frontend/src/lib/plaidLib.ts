import { API } from "aws-amplify";
import { UserType } from "../types/user";

export function getPlaidInstitutions(searchStr: string, institutionType: string) {
    return API.post("mox", `/plaid/institutions`, {
        body: {
            institution: searchStr,
            institutionType: institutionType,
        },
    });
}

export function getPlaidIncomeLinkToken(user: UserType) {
    return API.post("mox", `/plaid/createLinkToken`, {
        body: {
            user: user,
            productType: "payroll",
        },
    });
}

export function getPlaidAuthLinkToken(user: UserType) {
    return API.post("mox", `/plaid/createLinkToken`, {
        body: {
            user: user,
            productType: "auth",
        },
    });
}

export function setAuthAccessToken(user: UserType, publicToken: string) {
    return API.post("mox", `/plaid/setAuthAccessToken`, {
        body: {
            user: user,
            publicToken: publicToken,
        },
    });
}