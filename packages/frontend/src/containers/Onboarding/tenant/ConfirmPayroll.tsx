import { useState } from "react";
import { useFormFields } from "../../../lib/hooksLib";
import "./ConfirmPayroll.css";
import { getPlaidInstitutions } from "../../../lib/plaidLib";
import { onError } from "../../../lib/errorLib";
import Form from "react-bootstrap/Form";
import LoaderButton from "../../../components/LoaderButton";
import { Badge, Button, ListGroup, Stack } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserOnboardingStatus, userConfirmedPayrollAndBankSupported } from "../../../lib/userLib";
import { useAppContext } from "../../../lib/contextLib";
import { onboarding } from "../../../lib/onboardingLib";

export default function ConfirmPayroll() {
    const [fields, handleFieldChange] = useFormFields({
        institutionName: "",
    });

    interface InstitutionType {
        name: string,
        url: string,
        institution_id: string,
    };

    const [isLoading, setIsLoading] = useState(false);
    const [ supportedInstitutions, setSupportedInstitutions ] = useState<InstitutionType[]>([]);
    const [ selectedInstitutionType, setSelectedInstitutionType ] = useState("payroll");
    const {user} = useAppContext();
    const { setUserOnboardingStatus } = useAppContext();
    const { pathname } = useLocation();
    const nav = useNavigate();
    const [ payrollSupported, setPayrollSupported ] = useState(false);
    const [ bankSupported, setBankSupported ] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        try {
            const institutions = await getPlaidInstitutions(fields.institutionName, selectedInstitutionType);
            setSupportedInstitutions(institutions);
            if(institutions.length > 0) {
                if(selectedInstitutionType == "payroll"){
                    setPayrollSupported(true);
                } else {
                    setBankSupported(true);
                }
            }
        } catch(error) {
            onError(error);
        }
        setIsLoading(false);
    }

    async function handleConfirm() {
        await userConfirmedPayrollAndBankSupported(user);
        const newUserOnboardingSession = await getUserOnboardingStatus(user);
        setUserOnboardingStatus(newUserOnboardingSession);
        onboarding(nav, user, newUserOnboardingSession, pathname);
    }
    
    return(
        <div className="ConfirmPayroll">
            <h3 className="description">Confirm before paying</h3>
            <p className="description">Search for your payroll and bank institutions.<br />
                Supported Institutions will appear in the table below.<br /><br />
                If you cannot find your institution, we may not support it. Contact us at thao@mox.rent in that case.</p>
            <Form onSubmit={handleSubmit}>
                <Stack gap={3} className="mainStack">
                    <Form.Group controlId="institutionName" className="labelAndInput">
                        <Form.Control
                            autoFocus
                            size="lg"
                            type="text"
                            value={fields.institutionName}
                            onChange={handleFieldChange}
                            placeholder="Enter bank/payroll name"
                        />
                    </Form.Group>
                    <Form.Group controlId="institutionType" className="institutionTypeRadioButtons">
                        <Stack gap={3}>
                            <Form.Check
                                inline
                                label="Payroll Provider"
                                name="institutionType"
                                type="radio"
                                id="inline-radio-1"
                                value="payroll"
                                onChange={() => setSelectedInstitutionType("payroll")}
                                defaultChecked
                            />
                            <Form.Check
                                inline
                                label="Bank"
                                name="institutionType"
                                type="radio"
                                id="inline-radio-2"
                                value="balance"
                                onChange={() => setSelectedInstitutionType("balance")}
                            />
                        </Stack>
                    </Form.Group>
                    <LoaderButton
                        size="md"
                        type="submit"
                        isLoading={isLoading}
                        className="searchButton"
                        disabled={fields.institutionName==""}
                        >
                            Search
                    </LoaderButton>
                </Stack>
                <Stack gap={3}>
                    <h3 className="description">Supported Institutions:</h3>
                    <ListGroup className="resultList">
                        {supportedInstitutions && supportedInstitutions.map((institution) => (
                            <ListGroup.Item key={institution.institution_id} className="list-item-right-control">
                                <div className="upperRow">
                                    <div className="fw-bold">{institution.name}</div>
                                    <Badge className="supportedBadge" bg="success">supported</Badge>
                                </div>
                                {/* <a href={institution.url}>https://mox.rent</a> */}
                                <a href={institution.url}>{institution.url}</a>
                            </ListGroup.Item>
                        ))}
                        {supportedInstitutions.length == 0 && (
                            <ListGroup.Item key="noResults">
                                No results.
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                    <Button
                    className="continueButton"
                    disabled={!payrollSupported || !bankSupported}
                    onClick={() => handleConfirm()}
                    >
                        Confirm
                    </Button>
                </Stack>
            </Form>
        </div>
    );
}