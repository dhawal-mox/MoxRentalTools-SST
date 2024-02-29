import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../lib/contextLib"
import { useEffect, useState } from "react";
import { createStripeVerificationSession, getStripePublishableKey } from "../../lib/stripeLib";
import { Button, Form } from "react-bootstrap";

export default function StripeIDVerification() {
    const { user } = useAppContext();
    const nav = useNavigate();
    const [ stripePublsihableKey, setStripePublsihableKey ] = useState("");

    if(!user.purchased) {
        // nav('/purchase');
    }

    async function onLoad() {
        const result = await getStripePublishableKey();
        console.log(result);
        setStripePublsihableKey(result.stripePublsihableKey);
    }

    async function handleClick(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const responseData= await createStripeVerificationSession(user);
        const sessionUrl = responseData.sessionUrl;
        window.location.href = sessionUrl;
    }

    useEffect(() => {
        onLoad();
    }, [])

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