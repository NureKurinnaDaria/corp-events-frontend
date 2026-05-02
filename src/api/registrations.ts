import api from "./axios";

export const registrationsApi = {
  register: (eventId: string) =>
    api.post(`/registrations/${eventId}`).then((r) => r.data),

  cancel: (eventId: string) =>
    api.patch(`/registrations/${eventId}/cancel`).then((r) => r.data),

  getMyRegistrations: () => api.get("/registrations/my").then((r) => r.data),
};
