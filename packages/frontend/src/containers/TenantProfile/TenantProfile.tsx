import { useEffect, useState } from "react";
import { useAppContext } from "../../lib/contextLib"
import { getTenantProfile } from "../../lib/userLib";
import { Badge, Button, Col, Container, Row, Table } from "react-bootstrap";
import { BankAccount, IdInfo } from "../../types/userAccountsTypes";

export default function TenantProfile() {
    const { user } = useAppContext();
    const [ bankAccounts, setBankAccounts ] = useState<BankAccount[]>();
    const [ idInfo, setIdInfo ] = useState<IdInfo>();
    
    async function onLoad() {
        // const userProfile = await getTenantProfile(user);
        // console.log(userProfile);
        const result = await getTenantProfile(user);
        setBankAccounts(result.bankAccounts);
        setIdInfo(result.idInfo);
        console.log(result);
    }

    useEffect(() => {
        onLoad();
    }, [])

    const defaultOverviewData = {
        tenantName: 'John Doe',
        nameOnId: 'John May Doe',
        employerNames: ['Company A', 'Company B'],
        totalAnnualIncome: '$60,000',
        timeEmployed: '2 years',
        stateIDIssued: 'California',
        passedIDCheck: true
    };

    const defaultPayStubsData = [
        {
            payrollProvider: 'Provider A',
            payData: '01/01/2024',
            payPeriod: 'Weekly',
            grossPay: '$1,500',
            netPay: '$1,200',
            bankAccount: 'Bank of America - 1234',
        },
        {
            payrollProvider: 'Provider B',
            payData: '01/15/2024',
            payPeriod: 'Bi-weekly',
            grossPay: '$2,000',
            netPay: '$1,600',
            bankAccount: 'Chase Bank - 5678',
        }
    ];

    return (
        <div className="TenantProfile">
            <h2>Tenant Profile</h2>
             <Container>
            {/* Tenant Overview Section */}
            <Row>
                <Col>
                    <h2>{user.first_name} {user.last_name}</h2>
                    <p>Name on ID: {idInfo?.name}</p>

                </Col>
                <Col>
                    <h2>Overview</h2>
                    <Table striped bordered>
                        <tbody>
                            <tr>
                                <td>Employer</td>
                                <td>{defaultOverviewData.employerNames.join(', ')}</td>
                            </tr>
                            <tr>
                                <td>Total Annual Income</td>
                                <td>{defaultOverviewData.totalAnnualIncome}</td>
                            </tr>
                            <tr>
                                <td>Time Employed at Employer</td>
                                <td>{defaultOverviewData.timeEmployed}</td>
                            </tr>
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
                    <Table striped bordered>
                        <thead>
                            <tr>
                                <th>Payroll Provider</th>
                                <th>Pay Data</th>
                                <th>Pay Period</th>
                                <th>Gross Pay</th>
                                <th>Net Pay</th>
                                <th>Bank Account</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {defaultPayStubsData.map((stub, index) => (
                                <tr key={index}>
                                    <td>{stub.payrollProvider}</td>
                                    <td>{stub.payData}</td>
                                    <td>{stub.payPeriod}</td>
                                    <td>{stub.grossPay}</td>
                                    <td>{stub.netPay}</td>
                                    <td>{stub.bankAccount}</td>
                                    <td><Button variant="primary">View</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
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
                                    <td>{account.currentBalance}</td>
                                    <td>{account.availableBalance}</td>
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