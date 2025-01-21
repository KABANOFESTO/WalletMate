import axios from '@/lib/axios';

export enum AccountType {
  BANK = 'BANK',
  MOBILE_MONEY = 'MOBILE_MONEY',
  CASH = 'CASH',
  SAVINGS = 'SAVINGS',
  INVESTMENT = 'INVESTMENT'
}

// Map of account types to their display names
export const accountTypeDisplayNames: Record<AccountType, string> = {
  [AccountType.BANK]: 'Bank Account',
  [AccountType.MOBILE_MONEY]: 'Mobile Money',
  [AccountType.CASH]: 'Cash',
  [AccountType.SAVINGS]: 'Savings Account',
  [AccountType.INVESTMENT]: 'Investment Account'
};

export interface Account {
  id: number;
  user: {
    id: number;
  };
  name: string;
  type: AccountType;
  balance: number; // Note: This represents a BigDecimal from the backend
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDto {
  name: string;
  type: AccountType;
  balance: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export const accountService = {
  // Get all accounts for a user
  async getUserAccounts(userId: number): Promise<Account[]> {
    const response = await axios.get(`${API_URL}/accounts/user/${userId}`);
    return response.data;
  },

  // Get account by ID
  async getAccountById(id: number): Promise<Account> {
    const response = await axios.get(`${API_URL}/accounts/${id}`);
    return response.data;
  },

  // Create new account
  async createAccount(accountData: CreateAccountDto): Promise<Account> {
    const response = await axios.post(`${API_URL}/accounts`, accountData);
    return response.data;
  },

  // Update account
  async updateAccount(id: number, accountData: Partial<CreateAccountDto>): Promise<Account> {
    const response = await axios.put(`${API_URL}/accounts/${id}`, accountData);
    return response.data;
  },

  // Delete account
  async deleteAccount(id: number): Promise<void> {
    await axios.delete(`${API_URL}/accounts/${id}`);
  }
};
