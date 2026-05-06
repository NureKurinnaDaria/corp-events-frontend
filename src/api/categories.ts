import api from "./axios";
import type { Category } from "../types";

export const categoriesApi = {
  getAll: async (params?: {
    search?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<Category[]> => {
    const response = await api.get<Category[]>("/categories", { params });
    return response.data;
  },

  create: async (name: string): Promise<Category> => {
    const response = await api.post<Category>("/categories", { name });
    return response.data;
  },

  update: async (id: string, name: string): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, { name });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
