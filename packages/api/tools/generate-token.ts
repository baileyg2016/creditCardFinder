import { Configuration, CountryCode, LinkTokenCreateRequest, PlaidApi, PlaidEnvironments, Products } from 'plaid';
require('dotenv').config();

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || '';

const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
        'Plaid-Version': '2020-09-14',
      },
    },
});

const client = new PlaidApi(configuration);

const configs: LinkTokenCreateRequest = {
  user: {
    // This should correspond to a unique id for the current user.
    client_user_id: 'user-id',
  },
  client_name: 'Credit Card Finder',
  products: [Products.Transactions],
  country_codes: [CountryCode.Us],
  language: 'en',
};

if (PLAID_REDIRECT_URI !== '') {
  configs.redirect_uri = PLAID_REDIRECT_URI;
}

if (PLAID_ANDROID_PACKAGE_NAME !== '') {
  configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
}

const getPlaidTestToken = async () => {
  try {
    const createTokenResponse = await client.linkTokenCreate(configs);
    console.log(createTokenResponse.data);
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    console.error(error.message);
  }
}

getPlaidTestToken();