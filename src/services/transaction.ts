import axios from 'axios';
import { config } from '@/config';

const getAuthToken = () => localStorage.getItem('custom-auth-token');

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description?: string;
  date: string;
  category: {
    id: number;
    name: string;
  };
  subcategory?: {
    id: number;
    name: string;
  };
  account: {
    id: number;
    name: string;
    type: string;
    balance: number;
  };
}

export interface TransactionSummary {
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
  recentTransactions: Transaction[];
}

export async function getTransactionSummary(userId: number, period?: string): Promise<TransactionSummary> {
  try {
    const url = new URL(`${config.apiUrl}/api/transactions/summary/${userId}`);
    if (period) {
      url.searchParams.append('period', period);
    }
    const response = await axios.get<TransactionSummary>(url.toString(), {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch transaction summary');
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  try {
    const response = await axios.post<Transaction>(`${config.apiUrl}/api/transactions`, transaction, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to create transaction');
  }
}

export async function getUserTransactions(
  userId: number,
  startDate?: string,
  endDate?: string,
  type?: 'INCOME' | 'EXPENSE',
  categoryId?: number
): Promise<Transaction[]> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);
    if (categoryId) params.append('categoryId', categoryId.toString());

    const response = await axios.get<Transaction[]>(`${config.apiUrl}/api/transactions/user/${userId}?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch user transactions');
  }
}

export async function getAccountTransactions(
  accountId: number,
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<Transaction[]>(`${config.apiUrl}/api/transactions/account/${accountId}?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch account transactions');
  }
}

export async function updateTransaction(
  id: number,
  transaction: Partial<Transaction>
): Promise<Transaction> {
  try {
    const response = await axios.put<Transaction>(`${config.apiUrl}/api/transactions/${id}`, transaction, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to update transaction');
  }
}

export async function deleteTransaction(id: number): Promise<void> {
  try {
    await axios.delete(`${config.apiUrl}/api/transactions/${id}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    throw new Error('Failed to delete transaction');
  }
}
