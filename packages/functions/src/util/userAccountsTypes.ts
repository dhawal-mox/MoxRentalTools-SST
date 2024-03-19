export interface BankAccount {
    bankInstitution: string,
    accountName: string,
    accountType: string,
    currentBalance: string,
    availableBalance: string,
    last4Digits?: string,
    currentAsOfDate: number,
}

export interface IdInfo {
    stateIssued: string,
    last4Digits?: string,
    selfieCheck: boolean,
    documentCheck: boolean,
    name: string,
    city?: string,
    state?: string,
    country?: string,
    postalCode?: string,
    expirationDate?: string,
    validAsOf: number,
}

export interface PayrollOverview {
    employerName: string,
    employerAddressLine1: string,
    employerAddressLine2: string,
    timeEmployed: string,
    payAmount: string,
    payRate: string,
    payFrequency: string,
    payrollProvider: string,
    lastUpdatedAt: number,
}

export interface Paystub {
    payDate: string,
    payPeriod: string,
    grossPay: string,
    netPay: string,
    bankAccounts: string[],
    documentId: string,
}

export interface W2 {
    taxYear: string,
    documentId: string,
}