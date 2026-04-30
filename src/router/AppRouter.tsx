import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import EventsPage from "../pages/employee/EventsPage";
import EventDetailPage from "../pages/employee/EventDetailPage";
import MyRegistrationsPage from "../pages/employee/MyRegistrationsPage";
import AdminEventsPage from "../pages/admin/AdminEventsPage";
import AdminEventDetailPage from "../pages/admin/AdminEventDetailPage";
import AdminEventCreatePage from "../pages/admin/AdminEventCreatePage";
import AdminEventEditPage from "../pages/admin/AdminEventEditPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage";
import ProfilePage from "../pages/ProfilePage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <EventDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-registrations"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <MyRegistrationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminEventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/create"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminEventCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:id"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminEventDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminEventEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminCategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
