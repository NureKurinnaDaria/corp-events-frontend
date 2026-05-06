import api from "./axios";
import type { Event } from "../types";

export type EventDateFilter = "this_week" | "this_month";

export interface EventFilters {
  search?: string;
  format?: string;
  categoryId?: string;
  date?: EventDateFilter;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export interface EventPayload {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  format: "ONLINE" | "OFFLINE";
  location?: string;
  onlineUrl?: string;
  maxParticipants?: number;
  categoryId?: string;
}

export const eventsApi = {
  getAll: async (filters?: EventFilters): Promise<Event[]> => {
    const response = await api.get<Event[]>("/events", { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  create: async (payload: EventPayload): Promise<Event> => {
    const response = await api.post<Event>("/events", payload);
    return response.data;
  },

  update: async (
    id: string,
    payload: Partial<EventPayload>,
  ): Promise<Event> => {
    const response = await api.patch<Event>(`/events/${id}`, payload);
    return response.data;
  },

  deleteById: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  cancelById: async (id: string): Promise<Event> => {
    const response = await api.patch<Event>(`/events/${id}/cancel`);
    return response.data;
  },
};
