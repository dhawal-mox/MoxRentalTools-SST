import { useEffect, useState } from "react";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useAppContext } from "../../lib/contextLib";
import config from "../../config";
import { createStripePaymentIntent } from "../../lib/stripeLib";
import StripeCheckout from "./StripeCheckout";

export default function StripePayment () {
    
    const stripePromise = loadStripe(config.STRIPE_PUBLIC_KEY);
    const [clientSecret, setClientSecret] = useState("");
    const { user } = useAppContext();

    async function getClientSecret() {
        const result = await createStripePaymentIntent();
        console.log(result)
        setClientSecret(result.clientSecret);
    }

    useEffect(() => {
        getClientSecret();
    }, []);

    return (
        <div className="StripePayment">
            <h1>Payment</h1>
            {clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckout />
                </Elements>
            )}
        </div>
    )
}