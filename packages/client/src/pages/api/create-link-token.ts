import { plaidClient } from '../../lib/plaid';
import { CountryCode, Products } from 'plaid';

export default async function handler(req, res) {
  try {
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: process.env.PLAID_CLIENT_ID },
      client_name: "Card Compass",
      language: 'en',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      redirect_uri: process.env.PLAID_REDIRECT_URI,
    });
    console.log(tokenResponse.data)
    return res.json(tokenResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
}
