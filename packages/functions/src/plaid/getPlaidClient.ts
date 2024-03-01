import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

export default function getPlaidClient(PLAID_CLIENT_ID: any, PLAID_CLIENT_SECRET: any) {
    const configuration = new Configuration({
        basePath: PlaidEnvironments.sandbox,
        baseOptions: {
          headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_CLIENT_SECRET,
          },
        },
      });
      
      const plaidClient = new PlaidApi(configuration);
      return plaidClient;
}