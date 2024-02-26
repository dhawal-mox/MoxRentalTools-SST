import { API } from "aws-amplify";
import { UserType } from "../types/user";

export default function createUser(user: UserType) {
    return API.post("users", "/users", {
        body: user,
    });
}