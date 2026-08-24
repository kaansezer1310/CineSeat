import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";

/**
 * Rota koruyucusu — rol ve/veya izin tabanlı.
 *
 * Props:
 * - allowedRoles: string[] — geçiş dönemindeki rol tabanlı kontroller
 * - requiredPermissions: string[] — izin tabanlı erişim listesi
 * - permissionMode: "all" | "any" — izinlerin tamamı mı, biri mi gerekli
 * - redirectTo: string — giriş yapmamış kullanıcının gönderileceği rota
 *
 * İki yetkisizlik durumu ayrı ele alınır (Y2):
 * - Giriş yapılmamış → `redirectTo`'ya gider; hedef `state.from` içinde
 *   saklanır, giriş başarılı olunca kullanıcı oraya geri döner.
 * - Giriş yapılmış ama yetki yok → /forbidden'a gider. Login'e geri atmak
 *   sonsuz döngü üretirdi ve kullanıcıya sebebi anlatmazdı.
 */
function ProtectedRoute({
  allowedRoles = [],
  requiredPermissions = [],
  permissionMode = "all",
  redirectTo = "/login",
}) {
  const { user, role, hasPermission } = useAuth();
  const location = useLocation();

  const roleAllowed =
    allowedRoles.length === 0 || allowedRoles.includes(role);

  const permissionsAllowed =
    requiredPermissions.length === 0 ||
    (permissionMode === "any"
      ? requiredPermissions.some(hasPermission)
      : requiredPermissions.every(hasPermission));

  if (roleAllowed && permissionsAllowed) {
    return <Outlet />;
  }

  if (!user) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location, reason: "login-required" }}
      />
    );
  }

  return <Navigate to="/forbidden" replace state={{ from: location }} />;
}

export default ProtectedRoute;
