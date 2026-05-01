export type Role = "EMPLOYEE" | "ADMIN";

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
  id: number;
  name: string;
}

export type EventStatus = "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELED";

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  status: EventStatus;
  category: Category;
  participantsCount: number;
  averageRating?: number;
}

export interface Registration {
  id: number;
  event: Event;
  registeredAt: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  user: User;
  createdAt: string;
}
