import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";
import "./ForgotPassword.css";
import { Auth } from "aws-amplify";
import { useAppContext } from "../../lib/contextLib";
import LoaderButton from "../../components/LoaderButton";
import { onError } from "../../lib/errorLib";
import { useFormFields } from "../../lib/hooksLib";
import { getCurrentUser } from "../../lib/userLib";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [fields, handleFieldChange] = useFormFields({
    email: "",
    password: "",
    confirmPassword: "",
    confirmationCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [ sentConfirmationCode, setSentConfirmationCode ] = useState(false);

  const { userHasAuthenticated } = useAppContext();
  const { setUser } = useAppContext();
  const nav = useNavigate();

  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0 && fields.password == fields.confirmPassword;
  }

  function validateConfirmationForm() {
    return fields.confirmationCode.length > 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
        await Auth.forgotPassword(fields.email);
        setSentConfirmationCode(true);
    } catch(err) {
        onError(err);
    }
    setIsLoading(false);
  }

  async function handleConfirmationSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
        const data = await Auth.forgotPasswordSubmit(fields.email, fields.confirmationCode, fields.password);
        console.log(data);
        await Auth.signIn(fields.email, fields.password);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        userHasAuthenticated(true);
        nav('/');
    } catch(err) {
        onError(err);
    }
    setIsLoading(false);
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
            <Form.Label>New Password</Form.Label>
            <Form.Control
              size="lg"
              type="password"
              value={fields.password}
              onChange={handleFieldChange}
            />
          </Form.Group>
          <Form.Group controlId="confirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              size="lg"
              type="password"
              onChange={handleFieldChange}
              value={fields.confirmPassword}
            />
          </Form.Group>
          <LoaderButton
            size="lg"
            type="submit"
            variant="success"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Reset Password
          </LoaderButton>
        </Stack>
      </Form>
    );
  }
    
    return (
        <div className="ForgotPassword">
          {!sentConfirmationCode ? renderForm() : renderConfirmationForm()}
        </div>
    );

}