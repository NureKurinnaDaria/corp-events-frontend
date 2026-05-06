import api from "./axios";
import type { Registration, MyRegistrationsResponse, User } from "../types";

export interface EventParticipant {
  registrationId: string;
  user: User;
  registeredAt: string;
}

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

  getEventParticipants: async (
    eventId: string,
  ): Promise<EventParticipant[]> => {
    const response = await api.get<EventParticipant[]>(
      `/registrations/event/${eventId}`,
    );
    return response.data;
  },

  cancelByRegistrationId: async (registrationId: string): Promise<void> => {
    await api.delete(`/registrations/${registrationId}/admin-cancel`);
  },
};
