import api from "./axios";
import type { Event, EventFormat } from "../types";

export type EventDateFilter = "this_week" | "this_month";

export interface EventFilters {
  search?: string;
  format?: EventFormat;
  categoryId?: string;
  date?: EventDateFilter;
  sortOrder?: "asc" | "desc";
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
};
