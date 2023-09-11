import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface Column {
  id: 'name' | 'icon' | 'pointsToMoney' | 'totalPoints' | 'costAfterFee';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  // { id: 'icon', label: 'Icon', minWidth: 100 },
  { id: 'name', label: 'Name', minWidth: 170 },
  {
    id: 'pointsToMoney',
    label: 'Points to Money',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'totalPoints',
    label: 'Total Points',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toFixed(2),
  },
  {
    id: 'costAfterFee',
    label: 'Cost After Fee',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toFixed(2),
  }
];

type CardPoints = { [key: string]: number, fee: number };

interface CardsTableProps {
  cardPoints: CardPoints;
}

export default function CardsTable({ cardPoints }: CardsTableProps) {
  // const [page, setPage] = useState(0);
  // const [rowsPerPage, setRowsPerPage] = useState(10);

  // const handleChangePage = (event: unknown, newPage: number) => {
  //   setPage(newPage);
  // };

  // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setRowsPerPage(+event.target.value);
  //   setPage(0);
  // };

  return (
    <Paper sx={{ width: '100%' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell align="center" colSpan={2}>
                Card Info
              </TableCell>
              <TableCell align="center" colSpan={3}>
                Results
              </TableCell>
            </TableRow>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ top: 57, minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(cardPoints).sort((a, b) => b[1] - a[1]).map(([card, points]) => (
              <TableRow hover key={card}>
                <TableCell align='right'>{card}</TableCell>
                <TableCell align='right'>${Math.floor(points / 100)}</TableCell>
                <TableCell align='right'>{Math.floor(points)}</TableCell>
                <TableCell align='right'>${Math.floor(points / 100) - cardPoints.fee}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}