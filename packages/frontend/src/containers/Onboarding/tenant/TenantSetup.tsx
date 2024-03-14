import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../lib/contextLib";
import { onboarding } from "../../../lib/onboardingLib";
import { Container, ListGroup, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import "./TenantSetup.css";
import { BsArrowRepeat } from "react-icons/bs";
import { getUserOnboardingStatus, userSuccessfullyConnectedPlaidAuth, userSuccessfullyConnectedPlaidPayroll, userSuccessfullySubmittedId } from "../../../lib/userLib";
import { createStripeCheckoutSession, createStripeVerificationSession, getStripePublishableKey } from "../../../lib/stripeLib";
import { loadStripe } from "@stripe/stripe-js";
import { getPlaidAuthLinkToken, getPlaidIncomeLinkToken, setAuthAccessToken } from "../../../lib/plaidLib";
import LaunchLink from "./PlaidLinkLauncher";

export default function TenantSetup() {
    const { user, userOnboardingStatus, setUserOnboardingStatus } = useAppContext();
    const nav = useNavigate();
    const { pathname } = useLocation();

    const [ loadingStep, setLoadingStep ] = useState(0);
    const [ plaidIncomeLinkToken, setPlaidIncomeLinkToken ] = useState("");
    const [ plaidAuthLinkToken, setPlaidAuthLinkToken ] = useState("");

    interface Step {
        id: number;
        title: string;
        description: string;
        completed: boolean;
    }
    
    const initialSteps: Step[] = [
    { id: 1, title: 'Confirm Payroll Provider and Bank are supported', description: 'Ensure your accounts are supported before purchasing service.', completed: false },
    { id: 2, title: 'Payment for Services', description: 'Complete the payment to enable our services.', completed: false},
    { id: 3, title: 'Verify ID', description: 'Verify your US driver\'s license using Stripe Identity.', completed: false},
    { id: 4, title: 'Connect Payroll Account', description: 'Verifies your W2 income using Plaid Income.', completed: false},
    { id: 5, title: 'Connect Bank Account', description: 'Verifies your bank account balance using Plaid Auth.', completed: false},
    ];

    const [steps, setSteps] = useState<Step[]>(initialSteps);

    async function onLoad() {
        setUserOnboardingStatus(await getUserOnboardingStatus(user));
    }

    useEffect(() => {
        onLoad();
    }, []);

    useEffect(() => {
        onboarding(nav, user, userOnboardingStatus, pathname);
        let completedSteps = new Set();
        const statusDetails = userOnboardingStatus.statusDetail!.split(',');
        // console.log(statusDetails);
        console.log(userOnboardingStatus);
        for(const detail of statusDetails) {
            switch(detail) {
                case "plaid_payroll_bank_supported_confirmed":
                    completedSteps.add(1);
                    break;
                case "payment_complete":
                    completedSteps.add(2);
                    break;
                case "id_submitted": 
                    completedSteps.add(3);
                    break;
                case "payroll_linked":
                    completedSteps.add(4);
                    break;
                case "bank_linked":
                    completedSteps.add(5);
            }
        }
        const updatedSteps = steps.map(step =>
            completedSteps.has(step.id) ? { ...step, completed: true } : step
        );
        setSteps(updatedSteps);
        setLoadingStep(0);
    }, [userOnboardingStatus]);

    async function startStep(stepId: number) {
        stepId != 1 ? setLoadingStep(stepId) : setLoadingStep(0);
        switch(stepId) {
            case 1:
                nav("/confirmPayroll");
                break;
            case 2: // stripe checkout
                // after successful checkout, user is redirected to StripePurchase.tsx (/purchase). This updates the onboarding status detail
                const stripeCheckoutCreateResult = await createStripeCheckoutSession(user);
                const sessionUrl = stripeCheckoutCreateResult.sessionUrl;
                window.location.href = sessionUrl;
                break;
            case 3: //stripe id verify
                handleStripeIdVerify();
                break;
            case 4:
                handlePlaidPayroll();
                break;
            case 5:
                handlePlaidAuth();
                break;
        }
    }

    async function handleStripeIdVerify() {
        const stripePK = (await getStripePublishableKey()).stripePublishableKey;
        const stripe = await loadStripe(stripePK);
        const clientSecret = (await createStripeVerificationSession(user)).sessionClientSecret;
        const { error } = await stripe!.verifyIdentity(clientSecret);
        if(!error) {
            // verification submitted. update user onboarding status
            await userSuccessfullySubmittedId(user);
            setUserOnboardingStatus(await getUserOnboardingStatus(user));
        }
    }

    async function handlePlaidPayroll() {
        const linkToken = await fetchPlaidLinkToken(true);
        setPlaidIncomeLinkToken(linkToken);
    }

    async function handlePlaidAuth() {
        const linkToken = await fetchPlaidLinkToken(false);
        setPlaidAuthLinkToken(linkToken);
    }

    async function plaidIncomeSuccess(public_token: string) {
        console.log("payroll success");
        await userSuccessfullyConnectedPlaidPayroll(user);
        setUserOnboardingStatus(await getUserOnboardingStatus(user));
    }

    async function plaidAuthSuccess(public_token: string) {
        console.log("auth success");
        await setAuthAccessToken(user, public_token);
        await userSuccessfullyConnectedPlaidAuth(user);
        setUserOnboardingStatus(await getUserOnboardingStatus(user));
    }

    function plaidLinkExit() {
        setLoadingStep(0);
    }

    async function fetchPlaidLinkToken(payroll: boolean) {
        const linkTokenGetter = payroll ? getPlaidIncomeLinkToken : getPlaidAuthLinkToken;
        const response = await linkTokenGetter(user);
        console.log(`fetchLinkToken. link_token=${response.link_token}`);
        return response.link_token;
    }

    return (
        <div className="TenantSetup">
        <Container className="mt-5">
            <h1>Tenant Setup</h1>
            <h3>Let's setup your tenant profile.</h3>
            <ListGroup className="mt-3">
                {steps.map((step, index) => (
                <ListGroup.Item
                    key={step.id}
                    disabled={step.completed}
                    className="d-flex justify-content-between align-items-start listGroupItem"
                    id="listGroupItem"
                >
                    <div className="ms-2 me-auto">
                    <div className="fw-bold">{step.title}</div>
                    {step.description}
                    </div>
                    <Button
                    variant={step.completed ? "success" : "primary"}
                    onClick={() => startStep(step.id)}
                    disabled={(index > 0 && !steps[index - 1].completed) || step.id == loadingStep}
                    className="LoaderButton"
                    >
                    {step.id == loadingStep && <BsArrowRepeat className="spinning" />}
                    {step.completed ? "Completed" : step.id == loadingStep ? "Working" : "Start"}
                    </Button>
                </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
        {loadingStep==5 && <LaunchLink token={plaidAuthLinkToken} successCallback={plaidAuthSuccess} exitCallback={plaidLinkExit} />}
        {loadingStep==4 && <LaunchLink token={plaidIncomeLinkToken} successCallback={plaidIncomeSuccess} exitCallback={plaidLinkExit}/>}
        </div>
    );
}