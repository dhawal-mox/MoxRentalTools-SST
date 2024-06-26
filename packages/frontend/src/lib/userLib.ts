import { API } from "aws-amplify";
import { UserRole, UserType } from "../types/user";

export default function createUser(user: UserType) {
    return API.post("mox", "/users", {
        body: user,
    });
}

export function getCurrentUser() {
    return API.get("mox", `/users/user`, {});
}

export function updateUserRole(user: UserType, role: UserRole) {
    return API.post("mox", `/users/role`, {
        body: {
            userRole: role,
            user: user,
        },
    });
}

export async function getUserPurchased(user: UserType) {
    const result = await API.post("mox", `/users/purchased`, {
        body: {
            user: user,
        },
    })
    if(result.expiration) {
        user.purchased = result.expiration > Date.now() ? true : false;
        user.expiration = result.expiration;
    }
    else {
        user.purchased = false;
    }
    return user;
}

export async function getUserOnboardingStatus(user: UserType) {
    return API.post("mox", `/users/getUserOnboardingStatus`, {
        body: {
            user: user,
        },
    });
}

export async function getTenantProfile(user: UserType) {
    return API.post("mox", `/users/tenantProfile`, {
        body: {
            user: user,
        },
    });
}

export async function userConfirmedPayrollAndBankSupported(user: UserType) {
    return API.post("mox", `/users/userConfirmedPayrollAndBankSupported`, {
        body: {
            user: user,
        },
    });
}

export async function userSuccessfullyPurchased(user: UserType) {
    return API.post("mox", `/users/userSuccessfullyPurchased`, {
        body: {
            user: user,
        },
    });
}

export async function userSuccessfullySubmittedId(user: UserType) {
    return API.post("mox", `/users/userSuccessfullySubmittedId`, {
        body: {
            user: user,
        },
    });
}

export async function userSuccessfullyConnectedPlaidAuth(user: UserType) {
    return API.post("mox", `/users/userSuccessfullyConnectedPlaidAuth`, {
        body: {
            user: user,
        },
    });
}

export async function userSuccessfullyConnectedPlaidPayroll(user: UserType) {
    return API.post("mox", `/users/userSuccessfullyConnectedPlaidPayroll`, {
        body: {
            user: user,
        },
    });
}

export async function agentSetLicenseInfo(user: UserType, data: any) {
    return API.post("mox", `/agent/submitLicenseInfo`, {
        body: {
            user: user,
            licenseInfo: data, // {}
        },
    })
}

export async function getDocumentLink(user: UserType, documentId: string) {
    return API.post("mox", `/users/getDocumentLink`, {
        body: {
            user: user,
            documentId: documentId,
        },
    });
}