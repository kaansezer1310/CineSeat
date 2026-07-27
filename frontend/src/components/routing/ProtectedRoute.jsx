import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";

/**
 * Sprint 3 / 1.2.4 — Genişletilmiş ProtectedRoute (REQ-21, Güvenlik 4.2)
 *
 * Sprint 1 review'da (K2) sadece admin koruması vardı.
 * Şimdi üye-only sayfalar da korunuyor.
 *
 * Props:
 * - allowedRoles: string[] — izin verilen roller
 * - redirectTo: string — yetkisiz olunca yönlendirilecek rota (varsayılan: "/login")
 */
function ProtectedRoute({ allowedRoles, redirectTo = "/login" }) {
  const { role } = useAuth();

  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
