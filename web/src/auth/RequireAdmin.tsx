import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // TODO(is_admin): for now ANY logged-in user can open /admin. Once the API
  // reliably sets `user.admin`, enable this line (and the matching check on
  // the "Admin dashboard" link in Header.tsx):
  // if (!user.admin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
