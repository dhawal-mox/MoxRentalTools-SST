import { Button, ListGroup, Stack } from "react-bootstrap";
import './TenantFeatures.css';

export default function TenantFeatures() {
    return(
        <div className="TenantFeatures">
            <Stack gap={3} className="pageStack">
                <h3 className="headerText">Tenant Overview</h3>
                <h4 className="headerText">Here's how we will create your tenant profile:</h4>
                <ListGroup className="overviewList" as="ol" numbered variant="flush">
                    <ListGroup.Item as="li">Confirm that your payroll provider is supported.</ListGroup.Item>
                    <ListGroup.Item as="li">Confirm that your bank account is supported.</ListGroup.Item>
                    <ListGroup.Item as="li">Make payment for verification services.</ListGroup.Item>
                    <ListGroup.Item as="li">Verify your ID Document and do a selfie check.</ListGroup.Item>
                    <ListGroup.Item as="li">Connect your payroll account.</ListGroup.Item>
                    <ListGroup.Item as="li">Connect your bank account.</ListGroup.Item>
                    <ListGroup.Item as="li">Confirm everything looks right. Add notes if you need to.</ListGroup.Item>
                </ListGroup>
                <p className="headerText">If you have any questions at any point, please contact us at thao@mox.rent.</p>
                <Button className="letsGoButton">Let's get started</Button>
            </Stack>
        </div>
    )
}