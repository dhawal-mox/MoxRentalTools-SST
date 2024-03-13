import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../lib/contextLib"
import { useEffect, useState } from "react";
import { createStripeVerificationSession, getStripePublishableKey } from "../../lib/stripeLib";
import { Button, Form } from "react-bootstrap";
import { Stripe, loadStripe } from "@stripe/stripe-js";

export default function StripeIDVerification() {
    const { user } = useAppContext();
    const nav = useNavigate();
    const [ stripePublishableKey, setstripePublishableKey ] = useState<string>();
    const [ stripe, setStripe ] = useState<Stripe>();

    if(!user.purchased) {
        // nav('/purchase');
    }

    async function onLoad() {
        const result = await getStripePublishableKey();
        // console.log(result);
        setstripePublishableKey(result.stripePublishableKey);
    }

    async function setStripeObject() {
        // console.log(stripePublishableKey);
        const s = await loadStripe(stripePublishableKey!);
        setStripe(s!);
    }

    async function handleClick(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const responseData= await createStripeVerificationSession(user);
        // const sessionUrl = responseData.sessionUrl;
        const sessionClientSecret = responseData.sessionClientSecret;
        // console.log(`received stripe client secret ${sessionClientSecret}`);
        // window.location.href = sessionUrl;
        // const stripe = await loadStripe(stripePublishableKey);
        const {error} = await stripe!.verifyIdentity(sessionClientSecret);
        console.log(error);
    }

    useEffect(() => {
        onLoad();
    }, [])

    useEffect(() => {
        console.log(`logging pk - ${stripePublishableKey}`);
        setStripeObject();
    }, [stripePublishableKey])


    return (
        <div className="StripeIDVerification">
            <Form onSubmit={handleClick}>
                <Button role="link" type="submit">
                    Verify
                </Button>
            </Form>
        </div>
    )
}