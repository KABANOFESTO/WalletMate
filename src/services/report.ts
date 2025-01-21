import axios from '@/lib/axios';

export interface Report {
  id: number;
  userId: number;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  generatedAt: string;
}

export interface GenerateReportRequest {
  startDate: string;
  endDate: string;
}

export interface CategorySummary {
  categoryName: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface AccountSummary {
  accountId: number;
  accountName: string;
  accountType: string;
  currentBalance: number;
  transactions: {
    date: string;
    type: string;
    amount: number;
    description: string;
  }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export const reportService = {
  // Generate a detailed report
  async generateReport(userId: number, request: GenerateReportRequest): Promise<Record<string, any>> {
    const response = await axios.post(`${API_URL}/reports/user/${userId}/generate`, request);
    return response.data;
  },

  // Get filtered reports
  async getReports(
    userId: number,
    startDate?: string,
    endDate?: string,
    type?: string
  ): Promise<Record<string, any>[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);

    const response = await axios.get(`${API_URL}/reports/user/${userId}?${params.toString()}`);
    return response.data;
  },

  // Get category summary
  async getCategorySummary(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<Record<string, CategorySummary>> {
    const response = await axios.get(
      `${API_URL}/reports/user/${userId}/summary/category?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  // Get accounts summary
  async getAccountsSummary(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<Record<string, AccountSummary>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get(
      `${API_URL}/reports/user/${userId}/accounts/summary?${params.toString()}`
    );
    return response.data;
  }
};
