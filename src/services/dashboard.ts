import axios from '@/lib/axios';

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  budgetProgress: number;
  totalBalance: number;
  accountBalances: {
    bank: number;
    mobile: number;
    cash: number;
  };
  monthlyTransactions: {
    income: number[];
    expenses: number[];
  };
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
  }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
  
  const [accountsRes, transactionsRes, reportsRes] = await Promise.all([
    axios.get(`/api/accounts/user/${userId}`),
    axios.get('/api/transactions'),
    axios.get('/api/reports/summary')
  ]);

  const accounts = accountsRes.data;
  const transactions = transactionsRes.data;
  const reports = reportsRes.data;

  // Calculate total balance and account type balances
  const totalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
  const accountBalances = accounts.reduce((acc: any, account: any) => {
    acc[account.type.toLowerCase()] = (acc[account.type.toLowerCase()] || 0) + account.balance;
    return acc;
  }, { bank: 0, mobile: 0, cash: 0 });

  // Get monthly income and expenses from reports
  const monthlyData = reports.monthlyData || {
    income: new Array(12).fill(0),
    expenses: new Array(12).fill(0)
  };

  // Get recent transactions
  const recentTransactions = transactions
    .slice(0, 5)
    .map((t: any) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type.toLowerCase(),
      category: t.category.name
    }));

  return {
    totalIncome: reports.totalIncome || 0,
    totalExpenses: reports.totalExpenses || 0,
    budgetProgress: (reports.totalExpenses / reports.budgetLimit) * 100 || 0,
    totalBalance,
    accountBalances: {
      bank: accountBalances.bank,
      mobile: accountBalances.mobile,
      cash: accountBalances.cash
    },
    monthlyTransactions: monthlyData,
    recentTransactions
  };
}
