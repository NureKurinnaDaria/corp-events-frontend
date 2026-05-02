import api from "./axios";

export interface EventFilters {
  search?: string;
  format?: "ONLINE" | "OFFLINE";
  categoryId?: string;
  date?: "upcoming" | "this_week" | "this_month";
  sortOrder?: "asc" | "desc";
}

export const eventsApi = {
  getAll: (filters?: EventFilters) =>
    api.get("/events", { params: filters }).then((r) => r.data),

  getById: (id: string) => api.get(`/events/${id}`).then((r) => r.data),
};
