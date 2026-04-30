import { Navigate } from "react-router-dom";
import type { Role } from "../types";
import { useAuth } from "../context/AuthContext";

interface Props {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Завантаження...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;

  return <>{children}</>;
}
