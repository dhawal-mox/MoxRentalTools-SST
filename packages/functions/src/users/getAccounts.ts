import handler from "@mox-rental-tools-vanilla/core/handler";
import { getPlaidAuthAccounts } from "src/plaid/plaidAuthAccounts";
import { getPlaidPayrollAccounts } from "src/plaid/plaidPayrollAccounts";
import { getStripeIDVerificationResult } from "src/stripe/getIdVerificationResult";
import { BankAccount, IdInfo, PayrollOverview } from "src/util/userAccountsTypes";
import verifyRequestUser from "src/verifyRequestUser";
import Stripe from "stripe";

export const main = handler(async (event) => {
    verifyRequestUser(event);
    const data = JSON.parse(event.body!);
    const user = data.user;
    // const authAccounts = await getPlaidAuthAccounts(user.userId);
    // const payrollAccounts = await getPlaidPayrollAccounts(user.userId);
    
    const { accounts, institutionName, institutionId } = await getPlaidAuthAccounts(user.userId);
    let bankAccounts: BankAccount[] = [];
    for(const account of accounts) {
        const bankAccount: BankAccount = {
            bankInstitution: institutionName,
            accountName: account.officialName || account.name,
            accountType: `${account.type}, ${account.subtype}`,
            currentBalance: `\$${account.currentBalance}`,
            availableBalance: `\$${account.availableBalance}`,
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

    const { payrollItem, payrollAccounts, payStubsForAccounts, taxW2ForAccounts } = getPlaidPayrollAccounts(user.userId);
    const employerNames = new Set();
    for(const account of payrollAccounts) {
        account.employerNamesW2.map((employer: string) => {
            employerNames.add(employer);
        });
        account.employerNamesPaystub.map((employer: string) => {
            employerNames.add(employer);
        });
    }
    
    const payrollOveriew: PayrollOverview = {
        employerName: Array.from(employerNames).join(', '),
        employerAddressLine1: string,
        employerAddressLine2: string,
        timeEmployed: string,
        payAmount: string,
        payRate: string,
        payFrequency: string,
        payrollProvider: payrollItem.institutionName,
        lastUpdatedAt: payrollItem.updatedAt,
    }


    // return JSON.stringify({
    //     authAccounts: authAccounts,
    //     payrollAccounts: payrollAccounts,
    //     idVerificationResult: idVerificationResult,
    // });

    return JSON.stringify({
        bankAccounts: bankAccounts,
        idInfo: idInfo,
        // payrollAccounts: payrollAccounts,
    })
});