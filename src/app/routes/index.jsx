import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// NOTE: your layout is in src/app/layout/index.jsx
import DashboardLayout from "../layout/index.jsx";

import Landing from "../../pages/landing/Landing.jsx";
import Login from "../../pages/auth/Login.jsx";
import Register from "../../pages/auth/Register.jsx";
import Overview from "../../pages/dashboard/Overview.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Overview />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
