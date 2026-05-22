import api from "./axios";
import type { User } from "../types";

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  position?: string;
  password?: string;
  avatarUrl?: string;
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
};
