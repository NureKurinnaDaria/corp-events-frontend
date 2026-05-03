import api from "./axios";
import type { Registration, MyRegistrationsResponse } from "../types";

export const registrationsApi = {
  register: async (eventId: string): Promise<Registration> => {
    const response = await api.post<Registration>(`/registrations/${eventId}`);
    return response.data;
  },

  cancel: async (eventId: string): Promise<Registration> => {
    const response = await api.patch<Registration>(
      `/registrations/${eventId}/cancel`,
    );
    return response.data;
  },

  getMyRegistrations: async (): Promise<MyRegistrationsResponse> => {
    const response =
      await api.get<MyRegistrationsResponse>("/registrations/my");
    return response.data;
  },
};
