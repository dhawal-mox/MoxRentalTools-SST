import { API } from "aws-amplify";
import { UserRole, UserType } from "../types/user";

export default function createUser(user: UserType) {
    return API.post("users", "/users", {
        body: user,
    });
}

export function getCurrentUser() {
    return API.get("users", `/users/user`, {});
}

export function updateUserRole(user: UserType, role: UserRole) {
    return API.post("users", `/users/${user.userId}/role`, {
        body: {
            userRole: role,
        },
    });
}