import axiosInstance from '@/lib/axios';

export interface Category {
  id: number;
  name: string;
  description?: string;
  userId: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  userId: number;
  subcategories: string[];
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  subcategories: string[];
}

class CategoryService {
  async getCategories(userId: number): Promise<Category[]> {
    const response = await axiosInstance.get(`/categories/user/${userId}`);
    return response.data;
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await axiosInstance.post('/categories', data);
    return response.data;
  }

  async updateCategory(categoryId: number, data: UpdateCategoryRequest): Promise<Category> {
    const response = await axiosInstance.put(`/categories/${categoryId}`, data);
    return response.data;
  }

  async deleteCategory(categoryId: number): Promise<void> {
    await axiosInstance.delete(`/categories/${categoryId}`);
  }
}

export const categoryService = new CategoryService();
