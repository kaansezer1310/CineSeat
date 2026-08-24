import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";

/**
 * Rota koruyucusu — rol ve/veya izin tabanlı.
 *
 * Props:
 * - allowedRoles: string[] — izin verilen roller (opsiyonel)
 * - requiredPermissions: string[] — bunlardan EN AZ BİRİ gerekli (opsiyonel)
 * - redirectTo: string — giriş yapmamış kullanıcının gönderileceği rota
 *
 * İki farklı durumu ayırır (Y2):
 * - Giriş yapılmamış → /login'e gider; hedef `state.from` içinde saklanır,
 *   giriş başarılı olunca kullanıcı oraya geri döner.
 * - Giriş yapılmış ama yetki yok → /forbidden'a gider. Login'e geri atmak
 *   sonsuz döngü üretirdi ve kullanıcıya hiçbir açıklama vermezdi.
 */
function ProtectedRoute({
  allowedRoles,
  requiredPermissions,
  redirectTo = "/login",
}) {
  const { user, role, canAny } = useAuth();
  const location = useLocation();

  const isRoleAllowed = !allowedRoles || allowedRoles.includes(role);
  const isPermissionAllowed =
    !requiredPermissions || canAny(requiredPermissions);

  if (isRoleAllowed && isPermissionAllowed) {
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
