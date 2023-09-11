import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface BasicCardProps {
  title: string;
  cardName: string;
  points: number;
}

export default function BasicCard({ title, cardName, points }: BasicCardProps) {
  return (
    <Card sx={{ width: 250 }}>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" component="div">
          {cardName}
        </Typography>
        <Typography align='right' sx={{ mb: 1.5 }} color="text.secondary">
          {points}
        </Typography>
      </CardContent>
    </Card>
  );
}