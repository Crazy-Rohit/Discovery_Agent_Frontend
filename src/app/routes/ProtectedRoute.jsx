import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Phase 6:
 * - Prevents access to protected routes without token
 * - Uses replace=true so browser Back button cannot return
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
