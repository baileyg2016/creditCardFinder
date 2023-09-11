import { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState } from 'react';
import { withIronSessionSsr } from 'iron-session/next';
import { sessionOptions } from '../lib/plaid';
import { Transaction } from 'plaid';
import creditCards from '../cards/cards.json';
import CardsTable from '../components/cardsTable';
import BasicCard from '../components/basicCard';
import { Box, Grid, Paper, styled } from '@mui/material';

export type Card = {
  name: string;
  points: number;
  fee: number;
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const Transactions: NextPage<{ access_token: string }> = ({ access_token }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bestCard, setBestCard] = useState<string>('');
  const [topPoints, setTopPoints] = useState<number>(0);
  const [bestCardAfterFee, setBestCardAfterFee] = useState<string>('');
  const [topPointsAfterFee, setTopPointsAfterFee] = useState<number>(0);
  const [cardPoints, setCardPoints] = useState<{ [key: string]: { points: number, fee: number }}>({});

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
      setTransactions(data.transactions);
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const calculateBestCard = () => {
      let spendingHabits: any = {};
      let pointsPerCard: { [key: string]: { points: number, fee: number } } = {}; // Renamed variable
  
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
      let bestCardAfterFee = '';
      let bestPointsAfterFee = -Infinity;
  
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

        const cost = (cardPoints / 100) - card.fee;
        if (cost > bestPointsAfterFee) {
          bestPointsAfterFee = cost;
          bestCardAfterFee = card.name;

        }
  
        pointsPerCard[card.name] = { points: 0, fee: 0 };

        console.log(card.name, `${(cardPoints / 100)} - ${card.fee}`, (cardPoints / 100) - card.fee, bestPointsAfterFee)

        // Store the points for each card
        pointsPerCard[card.name].points = cardPoints; // Use the renamed variable
        pointsPerCard[card.name].fee = card.fee; // Subtract the fee
      });
  
      setBestCard(bestCard);
      setCardPoints(pointsPerCard); // Update the cardPoints state variable
      setBestCardAfterFee(bestCardAfterFee);
      setTopPoints(maxPoints);
      setTopPointsAfterFee(bestPointsAfterFee);
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
      <Box sx={{ flexGrow: 1 }}>
        <Grid container direction='row' justifyContent='center' rowSpacing={2} sx={{ flexGrow: 1 }}>
          <Grid item>
            <BasicCard title='Best Card Total Points' cardName={bestCard} points={Math.floor(topPoints)} />
          </Grid>
          <Grid item>
            <BasicCard title='Best Card Total Points After Fee' cardName={bestCardAfterFee} points={Math.floor(topPointsAfterFee)} />
          </Grid>
        </Grid>
      </Box>
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
