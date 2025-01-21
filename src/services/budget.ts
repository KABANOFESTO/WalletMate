import axios from '@/lib/axios';

export interface Budget {
  id: number;
  userId: number;
  categoryId: number;
  subcategoryId?: number;
  limit: number;
  currentSpent: number;
  startDate: string;
  endDate: string;
  categoryName: string;
  subcategoryName?: string;
  remainingAmount: number;
  spentPercentage: number;
}

export interface CreateBudgetRequest {
  userId: number;
  categoryId: number;
  subcategoryId?: number;
  limit: number;
  startDate: string;
  endDate: string;
}

export interface UpdateBudgetRequest {
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface Category {
  id: number;
  name: string;
  subcategories?: Category[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export const budgetService = {
  // Create a new budget
  async createBudget(request: CreateBudgetRequest): Promise<Budget> {
    const response = await axios.post(`${API_URL}/budgets`, request);
    return response.data;
  },

  // Get all budgets for a user
  async getUserBudgets(userId: number): Promise<Budget[]> {
    const response = await axios.get(`${API_URL}/budgets/user/${userId}`);
    return response.data;
  },

  // Get budget for a specific category
  async getCategoryBudget(userId: number, categoryId: number): Promise<Budget> {
    const response = await axios.get(`${API_URL}/budgets/category/${categoryId}?userId=${userId}`);
    return response.data;
  },

  // Get a specific budget
  async getBudget(budgetId: number): Promise<Budget> {
    const response = await axios.get(`${API_URL}/budgets/${budgetId}`);
    return response.data;
  },

  // Update a budget
  async updateBudget(budgetId: number, request: UpdateBudgetRequest): Promise<Budget> {
    const response = await axios.put(`${API_URL}/budgets/${budgetId}`, request);
    return response.data;
  },

  // Delete a budget
  async deleteBudget(budgetId: number): Promise<void> {
    await axios.delete(`${API_URL}/budgets/${budgetId}`);
  },

  // Get all categories for a user and category
  async getCategories(userId: number, categoryId: number): Promise<Category[]> {
    const response = await axios.get(`${API_URL}/budgets/user/${userId}/category/${categoryId}`);
    return response.data;
  },
};
