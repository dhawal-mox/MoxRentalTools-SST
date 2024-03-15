import React, { useEffect, useState } from 'react';
import { Form, Button, Col, Row, Alert } from 'react-bootstrap';
import { states } from "./states";
import "./LicenseSubmit.css"
import LoaderButton from '../../../components/LoaderButton';
import { agentSetLicenseInfo, getUserOnboardingStatus } from '../../../lib/userLib';
import { useAppContext } from '../../../lib/contextLib';
import { onboarding } from '../../../lib/onboardingLib';
import { useLocation, useNavigate } from 'react-router-dom';

export default function LicenseSubmit() {
    const [licenseNumber, setLicenseNumber] = useState('');
    const [stateOfLicensure, setStateOfLicensure] = useState('AL');
    const [typeOfLicense, setTypeOfLicense] = useState('');
    const [isLicenseRequired, setIsLicenseRequired] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const {user, userOnboardingStatus, setUserOnboardingStatus} = useAppContext();
    const nav = useNavigate();
    const {pathname} = useLocation();
    const stepsRequiredCompleted = [
        "payment_complete",
        "id_submitted",
    ];

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Logic to handle form submission, such as sending data to a backend.
        setIsLoading(true);
        // console.log({ licenseNumber, stateOfLicensure, typeOfLicense, isLicenseRequired });
        const postData = {
            licenseNumber: licenseNumber,
            stateOfLicensure: stateOfLicensure,
            typeOfLicense: typeOfLicense,
            isLicenseRequired: isLicenseRequired,
        };
        await agentSetLicenseInfo(user, postData);
        setUserOnboardingStatus(await getUserOnboardingStatus(user));
        setIsLoading(false);
    };

    useEffect(() => {
        let shouldReturn = false;
        const completedSteps = new Set(userOnboardingStatus.statusDetail!.split(","))
        // console.log(completedSteps);
        stepsRequiredCompleted.map(step => {
            shouldReturn = shouldReturn || !completedSteps.has(step);
        });
        // console.log(shouldReturn);
        if(shouldReturn) {
            nav("/agentSetup");
        } else {
            onboarding(nav, user, userOnboardingStatus, pathname);
        }
    }, [userOnboardingStatus]);

    return (
        <div className='LicenseSubmit'>
        <Form onSubmit={handleSubmit}>
            <h2>Real Estate Professional Information</h2>
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={4}>
                    Is a license required in your state?
                </Form.Label>
                <Col sm={6}>
                    <Form.Select
                        aria-label="License Required"
                        value={`${isLicenseRequired}`}
                        onChange={(e) => setIsLicenseRequired(e.target.value === 'true')}
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </Form.Select>
                </Col>
            </Form.Group>
            {isLicenseRequired && (
                <>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={4}>License Number:</Form.Label>
                        <Col sm={6}>
                            <Form.Control
                                type="text"
                                value={licenseNumber}
                                onChange={(e) => setLicenseNumber(e.target.value)}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={4}>State of Licensure:</Form.Label>
                        <Col sm={6}>
                            <Form.Select
                                value={stateOfLicensure}
                                onChange={(e) => setStateOfLicensure(e.target.value)}
                            >
                                {states.map((state) => (
                                    <option key={state.code} value={state.code}>
                                        {state.name} ({state.code})
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={4}>Type of License:</Form.Label>
                        <Col sm={6}>
                            <Form.Control
                                type="text"
                                value={typeOfLicense}
                                onChange={(e) => setTypeOfLicense(e.target.value)}
                            />
                        </Col>
                    </Form.Group>
                </>
            )}
            <Alert variant="secondary">
                <ul>
                    <li>This information will be presented to tenants who share their profile with you.</li>
                    <li>This information will be verified by us.</li>
                    <li>Providing invalid information may lead to a temporary or permamnent suspension of your account.</li>
                    <li>For questions, please email us at support@mox.rent from your registered email address.</li>
                    <li>Thank you.</li>
                </ul>
            </Alert>
            <LoaderButton
                variant="primary"
                type="submit"
                disabled={(isLicenseRequired ? (licenseNumber.length == 0 || stateOfLicensure.length == 0 || typeOfLicense.length == 0) : false)
                || isLoading}
                isLoading={isLoading}>
                Submit
            </LoaderButton>
        </Form>
        </div>
    );
};
