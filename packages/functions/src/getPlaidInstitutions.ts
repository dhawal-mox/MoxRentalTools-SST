import handler from "@mox-rental-tools-vanilla/core/handler";
import { Configuration, CountryCode, InstitutionsSearchRequest, PlaidApi, PlaidEnvironments, Products } from 'plaid';

export const main = handler(async (event) => {

  const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': "65a44234f70cf3001b2f9085",
        'PLAID-SECRET': "d78077c7deef7cc1ac7be25028f111",
      },
    },
  });
  
  const plaidClient = new PlaidApi(configuration);

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
    console.log(products);
    console.log(data.institution);
    try {
      const response = await plaidClient.institutionsSearch(request);
      console.log(response.data.institutions);
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