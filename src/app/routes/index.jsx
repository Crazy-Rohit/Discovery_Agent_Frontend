import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layout/index.jsx";



import Landing from "../../pages/landing/Landing.jsx";
import Login from "../../pages/auth/Login.jsx";
import Overview from "../../pages/dashboard/Overview.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing / Loading page */}
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
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
