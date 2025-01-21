'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useAuth } from '@/hooks/use-auth';
import {
  getUserTransactions,
  getTransactionSummary,
  type Transaction as BackendTransaction
} from '@/services/transaction';
import { TransactionsFilters } from '@/components/dashboard/Transactions/TransactionsFilters';
import { TransactionsTable } from '@/components/dashboard/Transactions/TransactionsTable';
import { AddTransactionDialog } from '@/components/dashboard/Transactions/AddTransactionPage';

// Map backend transaction to frontend format
const mapTransaction = (tx: BackendTransaction) => ({
  id: tx.id.toString(),
  description: tx.description || '',
  amount: tx.amount,
  type: tx.type === 'INCOME' ? 'Credit' : 'Debit',
  category: tx.category?.name || 'Uncategorized',
  date: new Date(tx.date),
  avatar: '', // Could be added later for category icons
  accountType: tx.account?.type || 'Unknown'
});

export default function Page(): React.JSX.Element {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [transactions, setTransactions] = React.useState<BackendTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    type: '',
    categoryId: undefined as number | undefined,
    search: ''
  } as {
    startDate: string;
    endDate: string;
    type: string;
    categoryId?: number | undefined;
    search: string;
  });

  // Fetch transactions when filters change
  React.useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const [transactions, summary] = await Promise.all([
          getUserTransactions(
            Number(user.id),
            filters.startDate,
            filters.endDate,
            filters.type as 'INCOME' | 'EXPENSE' | undefined,
            filters.categoryId
          ),
          getTransactionSummary(Number(user.id))
        ]);

        setTransactions(transactions);

        // Check budget limit
        if (summary.totalExpenses > summary.budgetProgress) {
          setError('Warning: You have exceeded your budget limit!');
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, filters]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
    // Refresh transactions after adding
    if (user?.id) {
      getUserTransactions(
        Number(user.id),
        filters.startDate,
        filters.endDate,
        filters.type as 'INCOME' | 'EXPENSE' | undefined,
        filters.categoryId
      ).then(setTransactions);
    }
  };

  const handleFilterChange = (filters: {
    startDate: string;
    endDate: string;
    type: string;
    categoryId?: number;
    search: string;
  }) => {
    setFilters(filters);
    setPage(0);
  };

  // Apply pagination to mapped transactions
  const paginatedTransactions = transactions
    .map(mapTransaction)
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Stack
      spacing={{ xs: 2, sm: 3 }}
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        maxWidth: '100%',
        overflowX: 'auto'
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 3 }}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <Stack
          spacing={1}
          sx={{
            flex: '1 1 auto',
            alignItems: { xs: 'center', sm: 'flex-start' }
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Transactions
          </Typography>
        </Stack>
        <Button
          fullWidth
          sx={{
            maxWidth: { xs: '100%', sm: 'auto' },
            minWidth: { sm: '200px' }
          }}
          startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
          variant="contained"
          onClick={handleOpenAddDialog}
        >
          Add Transaction
        </Button>
      </Stack>

      {error && (
        <Alert severity={error.includes('budget') ? 'warning' : 'error'} sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

      <TransactionsFilters onFilterChange={handleFilterChange} />

      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <TransactionsTable
          count={transactions.length}
          page={page}
          rows={paginatedTransactions}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>

      <AddTransactionDialog
        open={isAddDialogOpen}
        onClose={handleCloseAddDialog}
      />
    </Stack>
  );
}