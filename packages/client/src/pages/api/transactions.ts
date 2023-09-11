import { NextApiRequest, NextApiResponse } from 'next';
import { plaidClient } from '../../lib/plaid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { access_token, start_date, end_date } = req.body;

  try {
    const response = await plaidClient.transactionsGet({ access_token, start_date, end_date });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}