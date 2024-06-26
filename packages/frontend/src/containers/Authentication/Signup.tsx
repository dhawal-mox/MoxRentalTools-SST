import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormFields } from "../../lib/hooksLib";
import { useAppContext } from "../../lib/contextLib";
import LoaderButton from "../../components/LoaderButton";
import "./Signup.css";
import { Auth } from "aws-amplify";
import { onError } from "../../lib/errorLib";
import { ISignUpResult } from "amazon-cognito-identity-js";
import createUser, { getUserOnboardingStatus } from "../../lib/userLib";
import { onboarding } from "../../lib/onboardingLib";

export default function Signup() {
  const [fields, handleFieldChange] = useFormFields({
    email: "",
    password: "",
    confirmPassword: "",
    confirmationCode: "",
    firstName: "",
    lastName: "",
  });
  const nav = useNavigate();
  const { userHasAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState<null | ISignUpResult>(null);
  const { setUser } = useAppContext();
  const { setUserOnboardingStatus } = useAppContext();
  const { pathname } = useLocation();

  function validateForm() {
    return (
      fields.email.length > 0 &&
      fields.password.length > 0 &&
      fields.password === fields.confirmPassword &&
      fields.firstName.length > 0 &&
      fields.lastName.length > 0
    );
  }

  function validateConfirmationForm() {
    return fields.confirmationCode.length > 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const newUser = await Auth.signUp({
        username: fields.email,
        password: fields.password,
      });
      setIsLoading(false);
      setNewUser(newUser);
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }
  
  async function handleConfirmationSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setIsLoading(true);
    try {
      await Auth.confirmSignUp(fields.email, fields.confirmationCode);
      await Auth.signIn(fields.email, fields.password);
      const user = await createUser({
        first_name: fields.firstName,
        last_name: fields.lastName,
        email: fields.email,
      });
      setUser(user);
      const onboardingStatus = await getUserOnboardingStatus(user);
      setUserOnboardingStatus(onboardingStatus);
      userHasAuthenticated(true);
      // nav("/selectRole");
      onboarding(nav, user, onboardingStatus, pathname);
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  function renderConfirmationForm() {
    return (
      <Form onSubmit={handleConfirmationSubmit}>
        <Stack gap={3}>
          <Form.Group controlId="confirmationCode">
            <Form.Label>Confirmation Code</Form.Label>
            <Form.Control
              size="lg"
              autoFocus
              type="tel"
              onChange={handleFieldChange}
              value={fields.confirmationCode}
            />
            <Form.Text muted>Please check your email for the code.</Form.Text>
          </Form.Group>
          <LoaderButton
            size="lg"
            type="submit"
            variant="success"
            isLoading={isLoading}
            disabled={!validateConfirmationForm()}
          >
            Verify
          </LoaderButton>
        </Stack>
      </Form>
    );
  }

  function renderForm() {
    return (
      <Form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              size="lg"
              autoFocus
              type="email"
              value={fields.email}
              onChange={handleFieldChange}
            />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              size="lg"
              type="password"
              value={fields.password}
              onChange={handleFieldChange}
            />
          </Form.Group>
          <Form.Group controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              size="lg"
              type="password"
              onChange={handleFieldChange}
              value={fields.confirmPassword}
            />
          </Form.Group>
          <Form.Group controlId="firstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              onChange={handleFieldChange}
              value={fields.firstName}
            />
          </Form.Group>
          <Form.Group controlId="lastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              size="lg"
              type="text"
              onChange={handleFieldChange}
              value={fields.lastName}
            />
          </Form.Group>
          <LoaderButton
            size="lg"
            type="submit"
            variant="success"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Signup
          </LoaderButton>
        </Stack>
      </Form>
    );
  }

  return (
    <div className="Signup">
      {newUser === null ? renderForm() : renderConfirmationForm()}
    </div>
  );
}