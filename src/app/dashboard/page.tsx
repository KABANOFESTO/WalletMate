'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

import { config } from '@/config';
import { Income } from '@/components/dashboard/overview/Income';
import { RecentTransactions } from '@/components/dashboard/overview/RecentTransactions';
import { Update } from '@/components/dashboard/overview/Update';
import { IncomevsExpenses } from '@/components/dashboard/overview/IncomevsExpenses';
import { Budget } from '@/components/dashboard/overview/Budget';
import { Expenses } from '@/components/dashboard/overview/Expenses';
import { Balance } from '@/components/dashboard/overview/Balance';
import { BalanceCategories } from '@/components/dashboard/overview/BalanceCategories';
import { getTransactionSummary } from '@/services/transaction';
import { useAuth } from '@/hooks/use-auth';

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  budgetProgress: number;
  totalBalance: number;
  monthlyTransactions: {
    income: number[];
    expenses: number[];
  };
  accountBalances: {
    bank: number;
    mobile: number;
    cash: number;
  };
  recentTransactions: Array<{
    id: number;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: {
      id: number;
      name: string;
    };
    description?: string;
    date: string;
  }>;
}

const initialData: DashboardData = {
  totalIncome: 0,
  totalExpenses: 0,
  budgetProgress: 0,
  totalBalance: 0,
  monthlyTransactions: {
    income: [],
    expenses: []
  },
  accountBalances: {
    bank: 0,
    mobile: 0,
    cash: 0
  },
  recentTransactions: []
};

interface Transaction {
  id: number;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: {
    id: number;
    name: string;
  };
  description?: string;
  date: string;
}

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const [data, setData] = React.useState<DashboardData>(initialData);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const handleFetchData = async (): Promise<void> => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      const dashboardData = await getTransactionSummary(Number(user.id));
      setData(prevData => ({
        ...prevData,
        ...dashboardData
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void handleFetchData();
  }, [user?.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <Income
          diff={12}
          trend="up"
          sx={{ height: '100%' }}
          value={formatCurrency(data.totalIncome)}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Expenses
          diff={16}
          trend="down"
          sx={{ height: '100%' }}
          value={formatCurrency(data.totalExpenses)}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Budget
          sx={{ height: '100%' }}
          value={data.budgetProgress}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <Balance
          sx={{ height: '100%' }}
          value={formatCurrency(data.totalBalance)}
        />
      </Grid>
      <Grid lg={8} xs={12}>
        <IncomevsExpenses
          chartSeries={[
            {
              name: 'Income',
              data: data.monthlyTransactions.income
            },
            {
              name: 'Expenses',
              data: data.monthlyTransactions.expenses
            },
          ]}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid lg={4} md={6} xs={12}>
        <BalanceCategories
          chartSeries={[
            data.accountBalances.bank,
            data.accountBalances.mobile,
            data.accountBalances.cash
          ]}
          labels={['Bank', 'Mobile Money', 'Cash']}
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid xs={12}>
        <RecentTransactions
          transactions={data.recentTransactions.map((t: Transaction) => ({
            id: t.id.toString(),
            category: t.category.name,
            date: dayjs(t.date).format('DD MMM YYYY'),
            description: t.description,
            amount: formatCurrency(t.amount),
            type: t.type
          }))}
          sx={{ height: '100%' }}
        />
      </Grid>
    </Grid>
  );
}
