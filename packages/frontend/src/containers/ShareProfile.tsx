import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useFormFields } from '../lib/hooksLib';
import { NonTenantProfile } from '../types/userAccountsTypes';
import { getUserForShareCode } from '../lib/userLib';
import { useAppContext } from '../lib/contextLib';

export default function ShareProfilePage() {
  const { user } = useAppContext();
  const [fields, handleFieldChange] = useFormFields({
      shareCode: "",
  });
  const [userInfo, setUserInfo] = useState<NonTenantProfile>();
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      // Call API to fetch user ID associated with the share code
      // const userIdResponse = await fetch(`/api/share/${fields.shareCode}`);
      // const userIdData = await userIdResponse.json();
      
      // if (!userIdData.userId) {
      //   setError('Invalid share code.');
      //   return;
      // }

      // Call API to fetch user information
      // const userInfoResponse = await fetch(`/api/user/${userIdData.userId}`);
      // const userInfoData = await userInfoResponse.json();
      // setUserInfo(userInfoData);

      const response = await getUserForShareCode(user, fields.shareCode);
      if(response == "") {
        setError('Invalid share code');
        return;
      } 
      setUserInfo(response.userProfile!);
    } catch (error) {
      setError('Error fetching data. Please try again later.');
    }
  };

  useEffect(() => {
    console.log(userInfo);
  }, [userInfo]);

  const handleShareOverview = () => {
    // Implement logic to share overview profile with the user
  };

  const handleShareFullAccess = () => {
    // Implement logic to share full access profile with the user
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <h2>Share Profile</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="shareCode">
              <Form.Label>Enter Share Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter share code"
                value={fields.shareCode}
                onChange={handleFieldChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>
          {error && <Alert variant="danger">{error}</Alert>}
          {userInfo && (
            <div>
              <h3>User Information</h3>
              <p>Name: {userInfo.user.first_name}</p>
              <p>Name on ID: {userInfo.id.name}</p>
              <p>Email Address: {userInfo.user.email}</p>
              <p>ID Verification: {userInfo.id.documentVerified}</p>
              <Button variant="success" onClick={handleShareOverview}>
                Share Overview Profile
              </Button>{' '}
              <Button variant="success" onClick={handleShareFullAccess}>
                Share Full Access Profile
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
