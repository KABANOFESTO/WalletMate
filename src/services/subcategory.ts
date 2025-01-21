import axiosInstance from '@/lib/axios';

export interface SubcategoryDto {
    id?: number;
    categoryId: number;
    userId: number;
    name: string;
    description?: string;
}

class SubcategoryService {
    async createSubcategory(categoryId: number, data: SubcategoryDto): Promise<SubcategoryDto> {
        const response = await axiosInstance.post(`/subcategories/category/${categoryId}`, data);
        return response.data;
    }

    async getSubcategoriesByUserAndCategory(userId: number, categoryId: number): Promise<SubcategoryDto[]> {
        const response = await axiosInstance.get(`/subcategories/user/${userId}/category/${categoryId}`);
        return response.data;
    }
}

export const subcategoryService = new SubcategoryService();
