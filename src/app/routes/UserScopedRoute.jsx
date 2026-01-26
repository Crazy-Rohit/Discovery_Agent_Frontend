import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserSelection } from "../providers/UserSelectionProvider";

/**
 * Blocks access to user-scoped tabs (Logs, Screenshots, Insights) unless a user is selected.
 */
export default function UserScopedRoute({ children }) {
  const location = useLocation();
  const { selectedUser } = useUserSelection();

  if (!selectedUser) {
    return <Navigate to="/dashboard/users" replace state={{ from: location.pathname }} />;
  }

  return children;
}
