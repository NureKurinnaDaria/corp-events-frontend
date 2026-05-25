import api from "./axios";
import type { User } from "../types";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  position?: string;
  password?: string;
  avatarUrl?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  position: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  registrationsCount: number;
}

export interface AdminUserDetails {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  position: string | null;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  registrations: Array<{
    id: string;
    status: string;
    createdAt: string;
    event: { id: string; title: string; startAt: string; status: string };
  }>;
  feedbacks: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    event: { id: string; title: string };
  }>;
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/users/profile");
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await api.patch<User>("/users/profile", payload);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{ url: string }>(
      "/upload/image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data.url;
  },

  admin: {
    getAll: async (search?: string): Promise<AdminUser[]> => {
      const response = await api.get<AdminUser[]>("/users/admin/list", {
        params: search ? { search } : {},
      });
      return response.data;
    },

    getDetails: async (id: string): Promise<AdminUserDetails> => {
      const response = await api.get<AdminUserDetails>(`/users/admin/${id}`);
      return response.data;
    },

    block: async (id: string): Promise<void> => {
      await api.patch(`/users/admin/${id}/block`);
    },

    unblock: async (id: string): Promise<void> => {
      await api.patch(`/users/admin/${id}/unblock`);
    },
  },
};
