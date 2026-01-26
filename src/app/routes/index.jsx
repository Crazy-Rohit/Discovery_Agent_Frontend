import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layout/index.jsx";

import Landing from "../../pages/landing/Landing.jsx";
import Login from "../../pages/auth/Login.jsx";
import Register from "../../pages/auth/Register.jsx";

import Overview from "../../pages/dashboard/Overview.jsx";
import Logs from "../../pages/dashboard/Logs.jsx";
import Screenshots from "../../pages/dashboard/Screenshots.jsx";
import Users from "../../pages/dashboard/Users.jsx";
import UserDetail from "../../pages/dashboard/UserDetail.jsx";
import Insights from "../../pages/dashboard/Insights.jsx";
import Settings from "../../pages/dashboard/Settings.jsx";

function DashboardShell({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />

      <Route path="/dashboard/overview" element={<DashboardShell><Overview /></DashboardShell>} />
      <Route path="/dashboard/logs" element={<DashboardShell><Logs /></DashboardShell>} />
      <Route path="/dashboard/screenshots" element={<DashboardShell><Screenshots /></DashboardShell>} />
      <Route path="/dashboard/insights" element={<DashboardShell><Insights /></DashboardShell>} />

      <Route path="/dashboard/users" element={<DashboardShell><Users /></DashboardShell>} />
      <Route path="/dashboard/users/:company_username" element={<DashboardShell><UserDetail /></DashboardShell>} />

      <Route path="/dashboard/settings" element={<DashboardShell><Settings /></DashboardShell>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
