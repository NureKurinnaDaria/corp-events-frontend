import api from "./axios";

export interface FeedbackPayload {
  eventId: string;
  rating: number;
  comment: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string | null;
    email: string;
    position: string | null;
  };
}

export const feedbackApi = {
  create: async (payload: FeedbackPayload): Promise<Feedback> => {
    const response = await api.post<Feedback>("/feedback", payload);
    return response.data;
  },

  getMy: async (): Promise<Feedback[]> => {
    const response = await api.get<Feedback[]>("/feedback/my");
    return response.data;
  },

  getByEvent: async (eventId: string): Promise<Feedback[]> => {
    const response = await api.get<Feedback[]>(`/feedback/event/${eventId}`);
    return response.data;
  },
};
