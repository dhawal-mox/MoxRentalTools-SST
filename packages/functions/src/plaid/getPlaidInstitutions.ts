import handler from "@mox-rental-tools-vanilla/core/handler";
import { Configuration, CountryCode, InstitutionsSearchRequest, PlaidApi, PlaidEnvironments, Products } from 'plaid';
import getPlaidClient from "./getplaidClient";
import { Config } from "sst/node/config";

export const main = handler(async (event) => {
  const plaidClient = getPlaidClient(Config.PLAID_CLIENT_ID, Config.PLAID_CLIENT_SECRET);

  let data = {
      institution : "",
      institutionType: "",
  };
  
  if (event.body != null) {
      data = JSON.parse(event.body);
  }

  const products = data.institutionType == "payroll" ? 
    [Products.Employment, Products.IncomeVerification] : 
    [Products.Balance];

  let result = {};
  const request: InstitutionsSearchRequest = {
    query: data.institution,
    products: products,
    country_codes: [CountryCode.Us],
  };

  try {
    const response = await plaidClient.institutionsSearch(request);
    result = response.data.institutions.map(institution => ({
      name: institution.name,
      url: institution.url,
    }));
  } catch (error) {
    // Handle error
    throw(error);
  }
  
  return JSON.stringify(result);
});