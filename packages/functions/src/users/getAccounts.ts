import handler from "@mox-rental-tools-vanilla/core/handler";
import { CreditPayStub, CreditPayStubEmployer } from "plaid";
import { getPlaidAuthAccounts } from "src/plaid/plaidAuthAccounts";
import { getPlaidPayrollAccounts } from "src/plaid/plaidPayrollAccounts";
import { getStripeIDVerificationResult } from "src/stripe/getIdVerificationResult";
import { BankAccount, IdInfo, PayrollOverview, Paystub } from "src/util/userAccountsTypes";
import verifyRequestUser from "src/verifyRequestUser";
import Stripe from "stripe";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const data = JSON.parse(event.body!);
    const user = data.user;
    
    const { accounts, institutionName, institutionId } = await getPlaidAuthAccounts(user.userId);
    let bankAccounts: BankAccount[] = [];
    for(const account of accounts) {
        const bankAccount: BankAccount = {
            bankInstitution: institutionName,
            accountName: account.officialName || account.name,
            accountType: `${account.type}, ${account.subtype}`,
            currentBalance: account.currentBalance,
            availableBalance: account.availableBalance,
            last4Digits: `${account.mask}`,
            currentAsOfDate: account.lastUpdatedAt,
        }
        bankAccounts.push(bankAccount);
    }

    const idVerificationResult = await getStripeIDVerificationResult(user.userId);
    const idNumber = idVerificationResult.document?.number!;
    const idAddress = idVerificationResult.document?.address!;
    const idExpirationDate = idVerificationResult.document?.expiration_date;

    const idInfo: IdInfo = {
        stateIssued: idVerificationResult.document?.issuing_country!,
        last4Digits: idNumber.substring(idNumber.length-4, idNumber.length),
        selfieCheck: idVerificationResult.selfie?.status == "verified",
        documentCheck: idVerificationResult.document?.status == "verified",
        name: `${idVerificationResult.document?.first_name} ${idVerificationResult.document?.last_name}`,
        city: idAddress.city || "",
        state: idAddress.state || "",
        country: idAddress.country || "",
        postalCode: idAddress.postal_code || "",
        expirationDate: `${idExpirationDate?.month}/${idExpirationDate?.day}/${idExpirationDate?.year}`,
        validAsOf: idVerificationResult.created*1000,
    }


    // payroll data: payrollOverview, paystubs, w2s
    const { payrollItem, payrollAccounts, payStubsForAccounts, taxW2ForAccounts } = await getPlaidPayrollAccounts(user.userId);

    // 1. payrollOverview
    let employers = new Map();
    let employees: string[] = [];
    payStubsForAccounts.map((paystub) => {
        const paystubData = paystub.data as CreditPayStub;
        if(paystubData.employer && paystubData.employer.name) {
            // console.log(JSON.stringify(paystubData.employer));
            employers.set(paystubData.employer.name, paystubData.employer);
        }
        if(paystubData.employee && paystubData.employee.name) {
            employees.push(paystubData.employee.name);
        }
    });
    
    if(employers.size > 1){
        console.info(`Found multiple employers from paystubs for userId: ${user.userId} and payrollItemId: ${payrollItem.itemId}`);
    }
    if(new Set(employees).size > 1){
        console.info(`Found multiple employees from paystubs for userId: ${user.userId} and payrollItemId: ${payrollItem.itemId}`);
    }

    let employer = null;
    if(employers.size > 0) {
        // select the first employer - we're assuming that each payroll account can have just one real employer
        // but Plaid's data structure makes it possible to have multiple for some reason.
        employer = employers.get(employers.keys().next().value) as CreditPayStubEmployer;
    }
    let employeeName = "";
    if(employees.length > 0) {
        // select the first employer - we're assuming that each payroll account can have just one real employer
        // but Plaid's data structure makes it possible to have multiple for some reason.
        employeeName = employees[0];
    }
    
    const payrollOveriew: PayrollOverview = {
        employerName: employer ? employer.name! : "",
        employerAddressLine1: employer ? employer.address.street! : "",
        employerAddressLine2: employer ? `${employer.address.city}, ${employer.address.region}, ${employer.address.country}\n${employer.address.postal_code}` : "",
        employeeName: employeeName,
        timeEmployed: "",
        payAmount: payrollAccounts[0].payAmount,
        payFrequency: payrollAccounts[0].payFrequency,
        payRate: payrollAccounts[0].payRate,
        payrollProvider: payrollItem.institutionName,
        lastUpdatedAt: payrollItem.updatedAt,
    };

    // paystubs
    let paystubs: Paystub[] = [];
    payStubsForAccounts.map((paystubFromDb) => {
        const paystubData = paystubFromDb.data as CreditPayStub;
        const paystub: Paystub = {
            payDate: paystubData.pay_period_details.pay_date!,
            payPeriod: `${paystubData.pay_period_details.start_date} - ${paystubData.pay_period_details.end_date}`,
            grossPay: paystubData.pay_period_details.gross_earnings!,
            netPay: paystubData.net_pay.current_amount!,
            isoCurrencyCode: paystubData.net_pay.iso_currency_code!,
            distribution: paystubData.pay_period_details.distribution_breakdown.map((distribution) => {
                return {
                    bankName: distribution.bank_name!,
                    amount: distribution.current_amount!,
                    isoCurrencyCode: distribution.iso_currency_code!,
                    mask: distribution.mask!,
                }
            }),
            documentId: paystubData.document_metadata.download_url ? paystubFromDb.documentId! : "",
        }
        paystubs.push(paystub);
    });

    return JSON.stringify({
        bankAccounts: bankAccounts,
        idInfo: idInfo,
        payrollOverview: payrollOveriew,
        paystubs: paystubs,
        // payrollAccounts: payrollAccounts,
    })
});