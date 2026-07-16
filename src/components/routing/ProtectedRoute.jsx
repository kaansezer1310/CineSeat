import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";

function ProtectedRoute({ allowedRoles }) {
  const { role } = useAuth();

  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
