import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, getCurrentUser } from "../model/authStorage";

export function ProtectedRoute({ children, allowedRole }: { children: ReactNode; allowedRole?: string }) {
  const token = getAccessToken();
  const user = getCurrentUser();
  const role = typeof user?.role === "string" ? user.role : user?.role?.name;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "ADMIN" ? "/admin" : "/pos"} replace />;
  }
  return children;
}
