import { AxiosResponse } from "axios";
import {
  CountryCode,
  LinkTokenCreateRequest,
  Products,
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  PaymentAmountCurrencyEnum,
  InstitutionsGetByIdRequest,
  AssetReportGetResponse
} from "plaid";

// read env vars from .env file
require('dotenv').config({
  path: './.dev.env'
});
const cors = require('cors');
const util = require('util');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS: Products[] = [Products.Transactions] //(process.env.PLAID_PRODUCTS) ?? [Products.Transactions];

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES: CountryCode[] = [CountryCode.Us];

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

// Parameter used for OAuth in Android. This should be the package name of your app,
// e.g. com.plaid.linksample
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || '';

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = process.env.PLAID_TEST_ACCESS_TOKEN || '';
let PUBLIC_TOKEN = '';
let ITEM_ID = '';
// The payment_id is only relevant for the UK Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store
let PAYMENT_ID = '';

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)

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
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());
app.use(cors());

app.get('/testing', (request, response, next) => {
  response.json({
    'yes': 'you are connected'
  });
});

app.post('/api/info', function (request, response, next) {
  response.json({
    item_id: ITEM_ID,
    access_token: ACCESS_TOKEN,
    products: PLAID_PRODUCTS,
  });
});

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#create-link-token
app.post('/api/create_link_token', async function (request, response) {
  const configs: LinkTokenCreateRequest = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: 'user-id',
    },
    client_name: 'Credit Card Finder',
    products: PLAID_PRODUCTS,
    country_codes: PLAID_COUNTRY_CODES,
    language: 'en',
  };

  if (PLAID_REDIRECT_URI !== '') {
    configs.redirect_uri = PLAID_REDIRECT_URI;
  }

  if (PLAID_ANDROID_PACKAGE_NAME !== '') {
    configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
  }
  try {
    const createTokenResponse = await client.linkTokenCreate(configs);
    prettyPrintResponse(createTokenResponse);
    response.json(createTokenResponse.data);
  } catch (e) {
    const error: Error = (e as unknown) as Error;

    console.log('getting error in create_link_token')
    console.error(e)

    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Create a link token with configs which we can then use to initialize Plaid Link client-side.
// See https://plaid.com/docs/#payment-initiation-create-link-token-request
app.post(
  '/api/create_link_token_for_payment',
  async function (request, response, next) {
    try {
      const createRecipientResponse = await client.paymentInitiationRecipientCreate(
        {
          name: 'Harry Potter',
          iban: 'GB33BUKB20201555555555',
          address: {
            street: ['4 Privet Drive'],
            city: 'Little Whinging',
            postal_code: '11111',
            country: 'GB',
          },
        },
      );
      const recipientId = createRecipientResponse.data.recipient_id;
      prettyPrintResponse(createRecipientResponse);

      const createPaymentResponse = await client.paymentInitiationPaymentCreate(
        {
          recipient_id: recipientId,
          reference: 'paymentRef',
          amount: {
            value: 12.34,
            currency: PaymentAmountCurrencyEnum.Gbp,
          },
        },
      );
      prettyPrintResponse(createPaymentResponse);
      const paymentId = createPaymentResponse.data.payment_id;
      
      const configs = {
        user: {
          // This should correspond to a unique id for the current user.
          client_user_id: 'user-id',
        },
        client_name: 'Plaid Quickstart',
        products: PLAID_PRODUCTS,
        country_codes: PLAID_COUNTRY_CODES,
        language: 'en',
        payment_initiation: {
          payment_id: paymentId,
        },
      };

      const createTokenResponse = await client.linkTokenCreate(configs);
      prettyPrintResponse(createTokenResponse);
      response.json(createTokenResponse.data);
    } catch (e) {
      const error: Error = (e as unknown) as Error;
      prettyPrintResponse(error.message);
      return response.json(formatError(error.message));
    }
  },
);

// Exchange token flow - exchange a Link public_token for
// an API access_token
// https://plaid.com/docs/#exchange-token-flow
app.post('/api/set_access_token', async function (request, response, next) {
  const publicToken: string = request.body.public_token;
  console.log('public_token')
  console.log(publicToken)
  try {
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });
    console.log('token', publicToken)
    prettyPrintResponse(tokenResponse);
    ACCESS_TOKEN = ACCESS_TOKEN ? ACCESS_TOKEN : tokenResponse.data.access_token;
    const itemId: string = tokenResponse.data.item_id;
    response.json({
      access_token: ACCESS_TOKEN,
      item_id: itemId,
    });
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    console.log('getting error in set_access_token')
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Retrieve ACH or ETF Auth data for an Item's accounts
// https://plaid.com/docs/#auth
app.get('/api/auth', async function (request, response, next) {
  try {
    const authResponse = await client.authGet({ access_token: ACCESS_TOKEN });
    prettyPrintResponse(authResponse);
    response.json(authResponse.data);
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
app.get('/api/transactions', async function (request, response, next) {
  // Pull transactions for the Item for the last 30 days
  const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  const endDate = moment().format('YYYY-MM-DD');
  console.log('access_token', ACCESS_TOKEN)
  const configs = {
    access_token: ACCESS_TOKEN,
    start_date: startDate,
    end_date: endDate,
    options: {
      count: 250,
      offset: 0,
    },
  };
  try {
    const transactionsResponse = await client.transactionsGet(configs);
    prettyPrintResponse(transactionsResponse);
    response.json(transactionsResponse.data);
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    console.error(error)
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Retrieve Investment Transactions for an Item
// https://plaid.com/docs/#investments
app.get(
  '/api/investment_transactions',
  async function (request, response, next) {
    const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');
    const configs = {
      access_token: ACCESS_TOKEN,
      start_date: startDate,
      end_date: endDate,
    };
    try {
      const investmentTransactionsResponse = await client.investmentsTransactionsGet(
        configs,
      );
      prettyPrintResponse(investmentTransactionsResponse);
      response.json({
        error: null,
        investment_transactions: investmentTransactionsResponse.data,
      });
    } catch (e) {
      const error: Error = (e as unknown) as Error;
      prettyPrintResponse(error.message);
      return response.json(formatError(error.message));
    }
  },
);

// Retrieve Identity for an Item
// https://plaid.com/docs/#identity
app.get('/api/identity', async function (request, response, next) {
  try {
    const identityResponse = await client.identityGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(identityResponse);
    response.json({ identity: identityResponse.data.accounts });
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Retrieve real-time Balances for each of an Item's accounts
// https://plaid.com/docs/#balance
app.get('/api/balance', async function (request, response, next) {
  try {
    const balanceResponse = await client.accountsBalanceGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(balanceResponse);
    response.json(balanceResponse.data);
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Retrieve Holdings for an Item
// https://plaid.com/docs/#investments
app.get('/api/holdings', async function (request, response, next) {
  try {
    const holdingsResponse = await client.investmentsHoldingsGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(holdingsResponse);
    response.json({ error: null, holdings: holdingsResponse.data });
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Retrieve information about an Item
// https://plaid.com/docs/#retrieve-item
app.get('/api/item', async function (request, response, next) {
  try {
    // Pull the Item - this includes information about available products,
    // billed products, webhook information, and more.
    const itemResponse = await client.itemGet({ access_token: ACCESS_TOKEN });
    // Also pull information about the institution
    const configs: InstitutionsGetByIdRequest = {
      institution_id: itemResponse.data.item.institution_id ?? '',
      country_codes: [CountryCode.Us],
    };
    const instResponse = await client.institutionsGetById(configs);
    prettyPrintResponse(itemResponse);
    response.json({
      item: itemResponse.data.item,
      institution: instResponse.data.institution,
    });
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Retrieve an Item's accounts
// https://plaid.com/docs/#accounts
app.get('/api/accounts', async function (_request, response, _next) {
  try {
    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(accountsResponse);
    response.json(accountsResponse.data);
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// Create and then retrieve an Asset Report for one or more Items. Note that an
// Asset Report can contain up to 100 items, but for simplicity we're only
// including one Item here.
// https://plaid.com/docs/#assets
app.get('/api/assets', async function (request, response, next) {
  // You can specify up to two years of transaction history for an Asset
  // Report.
  const daysRequested = 10;

  // The `options` object allows you to specify a webhook for Asset Report
  // generation, as well as information that you want included in the Asset
  // Report. All fields are optional.
  const options = {
    client_report_id: 'Custom Report ID #123',
    // webhook: 'https://your-domain.tld/plaid-webhook',
    user: {
      client_user_id: 'Custom User ID #456',
      first_name: 'Alice',
      middle_name: 'Bobcat',
      last_name: 'Cranberry',
      ssn: '123-45-6789',
      phone_number: '555-123-4567',
      email: 'alice@example.com',
    },
  };
  const configs = {
    access_tokens: [ACCESS_TOKEN],
    days_requested: daysRequested,
    options,
  };
  try {
    const assetReportCreateResponse = await client.assetReportCreate(configs);
    prettyPrintResponse(assetReportCreateResponse);
    const assetReportToken = assetReportCreateResponse.data.asset_report_token;
    const getResponse = await getAssetReportWithRetries(
      client,
      assetReportToken,
    );
    const pdfRequest = {
      asset_report_token: assetReportToken,
    };

    const pdfResponse = await client.assetReportPdfGet(pdfRequest, {
      responseType: 'arraybuffer',
    });
    prettyPrintResponse(getResponse);
    prettyPrintResponse(pdfResponse);
    response.json({
      json: (getResponse as AxiosResponse<AssetReportGetResponse>).data.report,
      pdf: pdfResponse.data.toString('base64'),
    });
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

// This functionality is only relevant for the UK Payment Initiation product.
// Retrieve Payment for a specified Payment ID
app.get('/api/payment', async function (request, response, next) {
  try {
    const paymentGetResponse = await client.paymentInitiationPaymentGet({
      payment_id: PAYMENT_ID,
    });
    prettyPrintResponse(paymentGetResponse);
    response.json({ error: null, payment: paymentGetResponse.data });
  } catch (e) {
    const error: Error = (e as unknown) as Error;
    prettyPrintResponse(error.message);
    return response.json(formatError(error.message));
  }
});

const server = app.listen(APP_PORT, function () {
  console.log('plaid-quickstart server listening on port ' + APP_PORT);
});

const prettyPrintResponse = (response) => {
  console.trace('here')
  console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.

const getAssetReportWithRetries = (
  plaidClient: PlaidApi,
  asset_report_token: string,
  ms = 1000,
  retriesLeft = 20,
) =>
  new Promise((resolve, reject) => {
    const request = {
      asset_report_token,
    };

    plaidClient
      .assetReportGet(request)
      .then((response: AxiosResponse<AssetReportGetResponse>) => {
        return resolve(response);
      })
      .catch(() => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            return reject('Ran out of retries while polling for asset report');
          }
          getAssetReportWithRetries(
            plaidClient,
            asset_report_token,
            ms,
            retriesLeft - 1,
          ).then((response) => resolve(response));
        }, ms);
      });
  });

const formatError = (error) => {
  return {
    error: { ...error.data, status_code: error.status },
  };
};
