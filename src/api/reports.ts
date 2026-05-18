import api from "./axios";

export interface ReportPhoto {
  id: string;
  url: string;
  createdAt: string;
}

export interface Report {
  id: string;
  eventId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  photos: ReportPhoto[];
}

export const reportsApi = {
  create: async (eventId: string, text: string): Promise<Report> => {
    const response = await api.post<Report>("/reports", { eventId, text });
    return response.data;
  },

  getByEvent: async (eventId: string): Promise<Report | null> => {
    try {
      const response = await api.get<Report>(`/reports/event/${eventId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  update: async (id: string, text: string): Promise<Report> => {
    const response = await api.patch<Report>(`/reports/${id}`, { text });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },

  addPhoto: async (id: string, url: string): Promise<Report> => {
    const response = await api.post<Report>(`/reports/${id}/photos`, { url });
    return response.data;
  },

  deletePhoto: async (photoId: string): Promise<void> => {
    await api.delete(`/reports/photos/${photoId}`);
  },

  uploadImage: async (file: File): Promise<string> => {
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
