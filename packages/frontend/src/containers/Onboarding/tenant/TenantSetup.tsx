import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../../lib/contextLib";
import { onboarding } from "../../../lib/onboardingLib";
import { Container, ListGroup, Button, Stack } from "react-bootstrap";
import { useEffect, useState } from "react";
import "./TenantSetup.css";
import { BsArrowRepeat } from "react-icons/bs";
import { getUserOnboardingStatus } from "../../../lib/userLib";
import { createStripeCheckoutSession } from "../../../lib/stripeLib";

export default function TenantSetup() {
    const { user, userOnboardingStatus, setUserOnboardingStatus } = useAppContext();
    const nav = useNavigate();
    const { pathname } = useLocation();

    const [ loadingStep, setLoadingStep ] = useState(0);

    onboarding(nav, user, userOnboardingStatus, pathname);

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

    useEffect(() => {
        let completedSteps = new Set();
        const statusDetails = userOnboardingStatus.statusDetail!.split(',');
        console.log(statusDetails);
        console.log(userOnboardingStatus);
        for(const detail of statusDetails) {
            switch(detail) {
                case "plaid_payroll_bank_supported_confirmed":
                    completedSteps.add(1);
                    break;
                case "payment_complete":
                    completedSteps.add(2);
                    break;
                case "id_verified": 
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
    }, [userOnboardingStatus]);

    useEffect(() => {
        // onLoad();
    }, [])

    async function onLoad(){
        const updatedUserOnboardingStatus = await getUserOnboardingStatus(user);
        setUserOnboardingStatus(updatedUserOnboardingStatus);
    }

    const handleCompleteStep = (stepId: number) => {
        // const updatedSteps = steps.map(step =>
        //     step.id === stepId ? { ...step, completed: true } : step
        // );
        // setSteps(updatedSteps);
    };

    async function startStep(stepId: number) {
        switch(stepId) {
            case 1:
                nav("/confirmPayroll");
                break;
            case 2: // stripe checkout
                setLoadingStep(2);
                const stripeCheckoutCreateResult = await createStripeCheckoutSession(user);
                const sessionUrl = stripeCheckoutCreateResult.sessionUrl;
                window.location.href = sessionUrl;
        }
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
                    disabled={index > 0 && !steps[index - 1].completed}
                    >
                    {step.id == loadingStep && <BsArrowRepeat className="spinning" />}
                    {step.completed ? "Completed" : "Start"}
                    </Button>
                </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
        </div>
    );
}