import { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState } from 'react';
import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from '../lib/plaid';
import { Transaction } from 'plaid';
import creditCards from '../cards/cards.json';
import CardsTable from '../components/cardsTable';

export type Card = {
  name: string;
  points: number;
  fee: number;
}

const Transactions: NextPage<{ access_token: string }> = ({ access_token }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bestCard, setBestCard] = useState<string>('');
  const [cardPoints, setCardPoints] = useState<{ [key: string]: number, fee: number }>({});

  useEffect(() => {
    const fetchTransactions = async () => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token,
          start_date: '2023-01-01',
          end_date: '2023-01-31',
        }),
      });
      
      const data = await response.json();
      console.log(data);
      setTransactions(data.transactions);
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const calculateBestCard = () => {
      let spendingHabits: any = {};
      let pointsPerCard: { [key: string]: number } = {}; // Renamed variable
  
      transactions.forEach((transaction) => {
        if (transaction.category) {
          if (transaction.category[0] in spendingHabits) {
            spendingHabits[transaction.category[0]] += transaction.amount;
          } else {
            spendingHabits[transaction.category[0]] = transaction.amount;
          }
        }
      });
  
      let maxPoints = 0;
      let bestCard = '';
  
      creditCards.forEach((card) => {
        let cardPoints = 0;
  
        for (const [category, amount] of Object.entries(spendingHabits)) {
          if (category in card.points) {
            cardPoints += card.points[category] * Math.abs(amount);
          } else if ('All' in card.points) {
            cardPoints += card.points['All'] * Math.abs(amount);
          }
        }
  
        if (cardPoints > maxPoints) {
          maxPoints = cardPoints;
          bestCard = card.name;
        }
  
        // Store the points for each card
        pointsPerCard[card.name] = cardPoints; // Use the renamed variable
        pointsPerCard['fee'] = card.fee; // Subtract the fee
      });
  
      setBestCard(bestCard);
      setCardPoints(pointsPerCard); // Update the cardPoints state variable
    };
  
    if (transactions.length > 0) {
      calculateBestCard();
    }
  }, [transactions]);

  useEffect(() => {
    const calculateBestCard = () => {
      let spendingHabits: any = {};

      transactions.forEach((transaction) => {
        if (transaction.category) {
          if (transaction.category[0] in spendingHabits) {
            spendingHabits[transaction.category[0]] += transaction.amount;
          } else {
            spendingHabits[transaction.category[0]] = transaction.amount;
          }
        }
      });

      let maxPoints = 0;
      let bestCard = '';

      creditCards.forEach((card) => {
        let cardPoints = 0;

        for (const [category, amount] of Object.entries(spendingHabits)) {
          if (category in card.points) {
            cardPoints += card.points[category] * amount;
          } else if ('All' in card.points) {
            cardPoints += card.points['All'] * amount;
          }
        }

        if (cardPoints > maxPoints) {
          maxPoints = cardPoints;
          bestCard = card.name;
        }
      });

      setBestCard(bestCard);
    };

    if (transactions.length > 0) {
      calculateBestCard();
    }
  }, [transactions]);

  return (
    <div>
      <h1>Best Credit Card for You: {bestCard}</h1>
      <table>
        <thead>
          <tr>
            <th>Card</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(cardPoints).map(([card, points]) => (
            <tr key={card}>
              <td>{card}</td>
              <td>{points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CardsTable cardPoints={cardPoints} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = withIronSessionSsr(
  async ({ req }) => {
    const access_token = req.session.access_token;

    if (!access_token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {
        access_token,
      },
    };
  },
  sessionOptions
);


export default Transactions;
