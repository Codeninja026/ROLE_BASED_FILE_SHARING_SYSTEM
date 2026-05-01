import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { RouteErrorBoundary } from "./components/layout/RouteErrorBoundary";
import { DashboardLayout } from "./layouts/DashboardLayout";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FilesPage } from "./pages/FilesPage";
import { SharedFilesPage } from "./pages/SharedFilesPage";
import { StarredFilesPage } from "./pages/StarredFilesPage";
import { TrashPage } from "./pages/TrashPage";
import { SessionGuard } from "./components/auth/SessionGuard";
import { AnalyticsDashboard } from "./pages/AnalyticsDashboard";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { ActivityLogPage } from "./pages/ActivityLogPage";
import { CompanyFilesPage } from "./pages/CompanyFilesPage";
import { StoragePage } from "./pages/StoragePage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminPage } from "./pages/AdminPage";
import { TeamManagementPage } from "./pages/TeamManagementPage";
import { NotFoundPage } from "./pages/NotFoundPage";

import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <SessionGuard>
              <RouteErrorBoundary>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected routes */}
                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/files" element={<FilesPage />} />
                    <Route path="/analytics" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager']}>
                        <AnalyticsDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/shared" element={<SharedFilesPage />} />
                    <Route path="/starred" element={<StarredFilesPage />} />
                    <Route path="/trash" element={<TrashPage />} />
                    <Route path="/storage" element={<StoragePage />} />
                    <Route path="/activity" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager']}>
                        <ActivityLogPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/vault" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager']}>
                        <CompanyFilesPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/team" element={
                      <ProtectedRoute allowedRoles={['manager', 'admin']}>
                        <TeamManagementPage />
                      </ProtectedRoute>
                    } />
                    {/* Admin only */}
                    <Route path="/admin" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin/audit" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AuditLogsPage />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </RouteErrorBoundary>
            </SessionGuard>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
