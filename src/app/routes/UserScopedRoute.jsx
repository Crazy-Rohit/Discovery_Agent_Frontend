import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

/**
 * UserScopedRoute
 *
 * Purpose:
 * - Enforce that Logs / Screenshots / Insights are NOT accessible directly
 * - They must be accessed ONLY via:
 *   Dashboard → Users → User Detail tabs
 *
 * This is a UX-level restriction.
 * RBAC and backend APIs remain unchanged.
 */

const BLOCKED_DIRECT_ROUTES = [
  "/dashboard/logs",
  "/dashboard/screenshots",
  "/dashboard/insights",
];

export default function UserScopedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Not logged in → login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Hard block direct access to global routes
  const isBlocked = BLOCKED_DIRECT_ROUTES.some((path) =>
    location.pathname.startsWith(path)
  );

  if (isBlocked) {
    return <Navigate to="/dashboard/users" replace />;
  }

  return children;
}
