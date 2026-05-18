import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/layout/Layout";

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
import AdminArchivePage from "../pages/admin/AdminArchivePage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Employee */}
      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <Layout>
              <EventsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <Layout>
              <EventDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-registrations"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <Layout>
              <MyRegistrationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-registrations/:id"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <Layout>
              <EventDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AdminEventsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/create"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AdminEventCreatePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:id"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AdminEventDetailPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AdminEventEditPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AdminCategoriesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AdminAnalyticsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/archive"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout>
              <AdminArchivePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Shared */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "ADMIN"]}>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
