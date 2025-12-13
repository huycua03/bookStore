import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

function ProtectedRoute({ children, adminOnly = false }) {
  const [authUser] = useAuth();

  if (!authUser) {
    // Not logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !authUser.isAdmin) {
    // Not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;








