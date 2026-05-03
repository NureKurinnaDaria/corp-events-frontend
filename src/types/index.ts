export type Role = "EMPLOYEE" | "ADMIN";

export type EventStatus = "PUBLISHED" | "ONGOING" | "COMPLETED" | "CANCELED";

export type EventFormat = "ONLINE" | "OFFLINE";

export type RegistrationStatus = "REGISTERED" | "CANCELED";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  position: string | null;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  format: EventFormat;
  status: EventStatus;
  location: string | null;
  onlineUrl: string | null;
  maxParticipants: number | null;
  participantsCount: number;
  categoryId: string | null;
  category: Category;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: string;
  event: Event;
  status: RegistrationStatus;
  registeredAt: string;
}

export interface MyRegistrationsResponse {
  upcoming: Registration[];
  completed: Registration[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  user: User;
  createdAt: string;
}
