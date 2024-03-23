import { useEffect, useState } from "react";
import { useAppContext } from "../../lib/contextLib"
import { getDocumentLink, getTenantProfile } from "../../lib/userLib";
import { Badge, Button, Col, Container, Row, Table } from "react-bootstrap";
import { BankAccount, IdInfo, PayrollOverview, Paystub } from "../../types/userAccountsTypes";
import LoaderButton from "../../components/LoaderButton";

export default function TenantProfile() {
    const { user } = useAppContext();
    const [ bankAccounts, setBankAccounts ] = useState<BankAccount[]>();
    const [ idInfo, setIdInfo ] = useState<IdInfo>();
    const [ payrollOverview, setPayrollOverview ] = useState<PayrollOverview>();
    const [ paystubs, setPaystubs ] = useState<Paystub[]>();
    const [ loadingDocumentId, setLoadingDocumentId ] = useState<string>();
    
    async function onLoad() {
        const result = await getTenantProfile(user);
        setBankAccounts(result.bankAccounts);
        setIdInfo(result.idInfo);
        setPayrollOverview(result.payrollOverview);
        setPaystubs(result.paystubs);
        setLoadingDocumentId("");
        console.log(result);
    }

    function formatCurrency(value: number) {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"}).format(value);
    }

    useEffect(() => {
        onLoad();
    }, []);

    async function viewDocument(documentId: string) {
        setLoadingDocumentId(documentId);
        const documentUrl = await getDocumentLink(user, documentId);
        setLoadingDocumentId("");
        const downloadLink = document.createElement('a');
        downloadLink.href = documentUrl.documentUrl;
        downloadLink.download = 'paystub.pdf'; // You can set custom filename here
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    return (
        <div className="TenantProfile">
            <h2>Tenant Profile</h2>
             <Container>
            {/* Tenant Overview Section */}
            <Row>
                <Col>
                    <h2>{user.first_name} {user.last_name}</h2>
                    <p>Name on ID: {idInfo?.name}</p>
                    <p>Name on Payroll Account: {payrollOverview?.employeeName}</p>

                </Col>
                <Col>
                    <h2>Overview</h2>
                    <Table striped bordered>
                        <tbody>
                            <tr>
                                <td>Employer</td>
                                <td>{payrollOverview?.employerName}</td>
                            </tr>
                            <tr>
                                <td>Income from payroll</td>
                                <td>{formatCurrency(payrollOverview?.payAmount!)} / {payrollOverview?.payRate}</td>
                            </tr>
                            {payrollOverview && payrollOverview?.timeEmployed != "" && 
                            <tr>
                                <td>Time Employed at Employer</td>
                                <td>{payrollOverview?.timeEmployed}</td>
                            </tr>
                            }
                            {idInfo && 
                            <tr>
                                <td>State where ID is issued</td>
                                <td>{idInfo?.stateIssued}</td>
                            </tr>
                            }
                            {idInfo && 
                            <tr>
                                <td>Selfie Check</td>
                                <td>{idInfo?.selfieCheck ? 
                                <Badge pill bg="success">
                                verified
                                </Badge>
                               : <Badge pill bg="warning" text="dark">
                                needs manual verification
                                </Badge>}</td>
                            </tr>
                            }
                            {idInfo && 
                            <tr>
                                <td>ID Check</td>
                                <td>{idInfo?.documentCheck ? 
                                <Badge pill bg="success">
                                verified
                                </Badge>
                               : <Badge pill bg="warning" text="dark">
                                needs manual verification
                                </Badge>}</td>
                            </tr>
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>

            {/* Pay Stubs Section */}
            <Row>
                <Col>
                    <h2>Pay Stubs</h2>
                    { paystubs && 
                    <Table striped bordered>
                        <thead>
                            <tr>
                                <th>Pay Date</th>
                                <th>Pay Period</th>
                                <th>Gross Pay</th>
                                <th>Net Pay</th>
                                <th>Deposit Distribution</th>
                                <th>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paystubs.map((stub, index) => (
                                <tr key={index}>
                                    <td>{stub.payDate}</td>
                                    <td>{stub.payPeriod}</td>
                                    <td>{formatCurrency(stub.grossPay)}</td>
                                    <td>{formatCurrency(stub.netPay)}</td>
                                    <td>{stub.distribution.length > 0 ? stub.distribution.toString() : "Not available."}</td>
                                    <td><LoaderButton 
                                    variant="primary"
                                    onClick={() => viewDocument(stub.documentId)}
                                    isLoading={loadingDocumentId == stub.documentId}
                                    >Download</LoaderButton></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    }
                </Col>
            </Row>

            {/* Bank Accounts Section */}
            {bankAccounts && 
            <Row>
                <Col>
                    <h2>Bank Accounts</h2>
                    <Table striped bordered>
                        <thead>
                            <tr>
                                <th>Bank Institution</th>
                                <th>Account Name</th>
                                <th>Type</th>
                                <th>Current Balance</th>
                                <th>Available Balance</th>
                                <th>Last 4 Digits</th>
                                <th>Current as of Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bankAccounts.map((account, index) => (
                                <tr key={index}>
                                    <td>{account.bankInstitution}</td>
                                    <td>{account.accountName}</td>
                                    <td>{account.accountType}</td>
                                    <td>{formatCurrency(account.currentBalance)}</td>
                                    <td>{formatCurrency(account.availableBalance)}</td>
                                    <td>{account.last4Digits}</td>
                                    <td>{new Date(account.currentAsOfDate).toDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>}

            {/* ID Info Section */}
            {idInfo && 
            <Row>
                <Col>
                    <h2>ID Info (Driver's License)</h2>
                    <Row>
                        <Col>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th>State</th>
                                        <th>Last 4 Digits</th>
                                        <th>Expiration Date</th>
                                        <th>Valid as of</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{idInfo.stateIssued}</td>
                                        <td>{idInfo.last4Digits}</td>
                                        <td>{idInfo.expirationDate}</td>
                                        <td>{new Date(idInfo.validAsOf).toDateString()}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                        <Col>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th>Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{idInfo.city}, {idInfo.state}, {idInfo.country}, {idInfo.postalCode}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Col>
            </Row>}
        </Container>
        </div>
    )
}