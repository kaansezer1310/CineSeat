import { Navigate, Outlet } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";

/**
 * Sprint 3 / 1.2.4 — Genişletilmiş ProtectedRoute (REQ-21, Güvenlik 4.2)
 *
 * Sprint 1 review'da (K2) sadece admin koruması vardı.
 * Şimdi üye-only sayfalar da korunuyor.
 *
 * Props:
 * - allowedRoles: string[] — geçiş dönemindeki rol tabanlı kontroller
 * - requiredPermissions: string[] — izin tabanlı erişim listesi
 * - permissionMode: "all" | "any" — izinlerin tamamı mı, biri mi gerekli
 * - redirectTo: string — yetkisiz olunca yönlendirilecek rota (varsayılan: "/login")
 */
function ProtectedRoute({
  allowedRoles = [],
  requiredPermissions = [],
  permissionMode = "all",
  redirectTo = "/login",
}) {
  const { role, hasPermission } = useAuth();

  const roleAllowed =
    allowedRoles.length === 0 || allowedRoles.includes(role);
  const permissionsAllowed =
    requiredPermissions.length === 0 ||
    (permissionMode === "any"
      ? requiredPermissions.some(hasPermission)
      : requiredPermissions.every(hasPermission));

  if (!roleAllowed || !permissionsAllowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
