import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../lib/contextLib";
import { onboarding } from "../../../lib/onboardingLib";
import { Container, ListGroup, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import "./AgentSetup.css";
import { BsArrowRepeat } from "react-icons/bs";
import { getUserOnboardingStatus, userSuccessfullySubmittedId } from "../../../lib/userLib";
import { createStripeCheckoutSession, createStripeVerificationSession, getStripePublishableKey } from "../../../lib/stripeLib";
import { loadStripe } from "@stripe/stripe-js";
import { onError } from "../../../lib/errorLib";
import LoaderButton from "../../../components/LoaderButton";

export default function TenantSetup() {
    const { user, userOnboardingStatus, setUserOnboardingStatus } = useAppContext();
    const nav = useNavigate();
    const { pathname } = useLocation();

    const [ loadingStep, setLoadingStep ] = useState(0);

    interface Step {
        id: number;
        title: string;
        description: string;
        completed: boolean;
    }
    
    const initialSteps: Step[] = [
    { id: 1, title: 'Payment for Services', description: 'Complete the payment to enable our services.', completed: false},
    { id: 2, title: 'Verify ID', description: 'Verify your US driver\'s license using Stripe Identity.', completed: false},
    { id: 3, title: 'Submit License #', description: 'Provide a valid Real Estate or Property Management license.', completed: false},
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
        for(const detail of statusDetails) {
            switch(detail) {
                case "payment_complete":
                    completedSteps.add(1);
                    break;
                case "id_submitted": 
                    completedSteps.add(2);
                    break;
                case "license_submitted" || "no_license_required":
                    completedSteps.add(3);
                    break;
            }
        }
        const updatedSteps = steps.map(step =>
            completedSteps.has(step.id) ? { ...step, completed: true } : step
        );
        setSteps(updatedSteps);
        setLoadingStep(0);
    }, [userOnboardingStatus]);

    async function startStep(stepId: number) {
        // stepId != 1 ? setLoadingStep(stepId) : setLoadingStep(0);
        setLoadingStep(stepId);
        switch(stepId) {
            case 1: // stripe checkout
                // after successful checkout, user is redirected to StripePurchase.tsx (/purchase). This updates the onboarding status detail
                const stripeCheckoutCreateResult = await createStripeCheckoutSession(user);
                const sessionUrl = stripeCheckoutCreateResult.sessionUrl;
                window.location.href = sessionUrl;
                break;
            case 2: //stripe id verify
                handleStripeIdVerify();
                break;
            case 3: // get license number
                handleLicenseSubmission();
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
        } else {
            setLoadingStep(0);
            onError(error);
        }
    }

    async function handleLicenseSubmission() {
        nav("/licenseSubmit");
    }

    return (
        <div className="AgentSetup">
        <Container className="mt-5">
            <h1>Agent Setup</h1>
            <h3>Let's setup your agent profile.</h3>
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
                    <LoaderButton
                    variant={step.completed ? "success" : "primary"}
                    onClick={() => startStep(step.id)}
                    disabled={(index > 0 && !steps[index - 1].completed) || step.id == loadingStep}
                    // className="LoaderButton"
                    isLoading={step.id == loadingStep}
                    >
                    {/* {step.id == loadingStep && <BsArrowRepeat className="spinning" />} */}
                    {step.completed ? "Completed" : step.id == loadingStep ? "Working" : "Start"}
                    </LoaderButton>
                </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
        </div>
    );
}