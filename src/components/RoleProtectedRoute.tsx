import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("patient" | "doctor" | "admin")[];
}

export const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on user's actual role
    if (userRole === "patient") {
      return <Navigate to="/patient-dashboard" replace />;
    } else if (userRole === "doctor") {
      return <Navigate to="/doctor-portal" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
