import { Cognito, StackContext, use } from "sst/constructs";
import { ApiStack } from "./ApiStack";


export function AuthStack({ stack, app }: StackContext) {
    const { api } = use(ApiStack);
    const auth = new Cognito(stack, "Auth", {
        identityPoolFederation: {
            auth0: {
                domain: "dev-8hq4jnuh0dzunpj7.us.auth0.com",
                clientId: "VvfhKSs55k10cqjUoQE94icOoMgmRsij",
            }
        }
    });

    //Allow authenticated users invoke API
    auth.attachPermissionsForAuthUsers(stack, [api]);

    stack.addOutputs({
        IdentityPoolId: auth.cognitoIdentityPoolId,
    });
}