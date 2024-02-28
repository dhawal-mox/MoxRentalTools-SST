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
    return API.post("mox", `/users/${user.userId}/role`, {
        body: {
            userRole: role,
        },
    });
}

export async function getUserPurchased(user: UserType) {
    const result = await API.post("mox", `/users/purchased`, {
        body: {
            userId: user.userId,
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