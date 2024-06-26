import { API } from "aws-amplify";
import { UserType } from "../types/user";

export function createStripePaymentIntent() {
    return API.post("mox", `/stripe/createPaymentIntent`, {
        body: {},
    });
}

export function createStripeCheckoutSession(user: UserType) {
    return API.post("mox", `/stripe/createCheckoutSession`, {
        body: {
            user: user,
        }
    });
}

export function getStripePublishableKey() {
    return API.get("mox", `/stripe/publishableKey`, {});
}

export function createStripeVerificationSession(user: UserType) {
    return API.post("mox", `/stripe/createVerificationSession`, {
        body: {
            user: user,
        }
    });
}