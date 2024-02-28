import { API } from "aws-amplify";

export function getPlaidInstitutions(searchStr: string, institutionType: string) {
    return API.post("mox", `/plaid/institutions`, {
        body: {
            institution: searchStr,
            institutionType: institutionType,
        },
    });
}