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
  const url = new URL(`${config.apiUrl}/api/transactions/summary/${userId}`);
  if (period) {
    url.searchParams.append('period', period);
  }

  const response = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Transaction summary error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error('Failed to fetch transaction summary');
  }
  return response.json();
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  const response = await fetch(`${config.apiUrl}/api/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(transaction)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create transaction error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error('Failed to create transaction');
  }
  return response.json();
}

export async function getUserTransactions(
  userId: number,
  startDate?: string,
  endDate?: string,
  type?: 'INCOME' | 'EXPENSE',
  categoryId?: number
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (type) params.append('type', type);
  if (categoryId) params.append('categoryId', categoryId.toString());

  const response = await fetch(
    `${config.apiUrl}/api/transactions/user/${userId}?${params.toString()}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get user transactions error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error('Failed to fetch user transactions');
  }
  return response.json();
}

export async function getAccountTransactions(
  accountId: number,
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await fetch(
    `${config.apiUrl}/api/transactions/account/${accountId}?${params.toString()}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get account transactions error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error('Failed to fetch account transactions');
  }
  return response.json();
}

export async function updateTransaction(
  id: number,
  transaction: Partial<Transaction>
): Promise<Transaction> {
  const response = await fetch(`${config.apiUrl}/api/transactions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(transaction)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update transaction error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error('Failed to update transaction');
  }
  return response.json();
}

export async function deleteTransaction(id: number): Promise<void> {
  const response = await fetch(`${config.apiUrl}/api/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Delete transaction error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error('Failed to delete transaction');
  }
}
