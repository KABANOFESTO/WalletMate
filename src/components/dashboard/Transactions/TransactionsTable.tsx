'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { formatDistanceToNow } from 'date-fns';
import { Bank as BankIcon } from '@phosphor-icons/react/dist/ssr/Bank';
import { Money as MoneyIcon } from '@phosphor-icons/react/dist/ssr/Money';
import { Wallet as WalletIcon } from '@phosphor-icons/react/dist/ssr/Wallet';

export interface Transaction {
  id: string;
  avatar: string;
  accountType: string;
  category: string;
  amount: number;
  date: Date;
  description: string;
  type: string;
}

interface TransactionsTableProps {
  count?: number;
  page?: number;
  rows?: Transaction[];
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const getAccountIcon = (accountType: string) => {
  switch (accountType.toLowerCase()) {
    case 'bank':
      return <BankIcon />;
    case 'mobile money':
      return <MoneyIcon />;
    case 'cash':
      return <WalletIcon />;
    default:
      return <BankIcon />;
  }
};

export function TransactionsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange,
}: TransactionsTableProps): React.JSX.Element {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Account</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((transaction) => {
              const isCredit = transaction.type === 'Credit';

              return (
                <TableRow hover key={transaction.id}>
                  <TableCell>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={2}
                    >
                      <Avatar
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText'
                        }}
                      >
                        {getAccountIcon(transaction.accountType)}
                      </Avatar>
                      <Typography variant="subtitle2">
                        {transaction.accountType}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {transaction.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {transaction.category}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      color={isCredit ? 'success.main' : 'error.main'}
                      variant="subtitle2"
                    >
                      {isCredit ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {formatDistanceToNow(transaction.date, { addSuffix: true })}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <TablePagination
        component="div"
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Card>
  );
}
