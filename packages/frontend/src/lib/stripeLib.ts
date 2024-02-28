import { API } from "aws-amplify";

export function createStripePaymentIntent() {
    return API.post("mox", `/stripe/createPaymentIntent`, {
        body: {},
    });
}

export function createStripeCheckoutSession(userRole: string) {
    return API.post("mox", `/stripe/createCheckoutSession`, {
        body: {
            userRole: `${userRole}`,
        }
    })
}