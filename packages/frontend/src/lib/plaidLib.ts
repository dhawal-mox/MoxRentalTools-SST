import { API } from "aws-amplify";

export function getPlaidInstitutions(searchStr: string, institutionType: string) {
    return API.post("users", `/plaid/institutions`, {
        body: {
            institution: searchStr,
            institutionType: institutionType,
        },
    });
}