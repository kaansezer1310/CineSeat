import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext.js";
import { authService } from "../services/authService.js";
import { setUnauthorizedHandler } from "../services/apiClient.js";
import useCart from "../hooks/useCart.js";

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("cineseat_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        console.error("Failed to parse user from session storage");
      }
    }
    return null;
  });

  // Token'ın süresi dolduğu için mi düştük, kullanıcı kendi mi çıktı —
  // LoginPage bu ayrımı kullanıcıya göstermek için okur.
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const { dispatch } = useCart();

  const clearSession = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("cineseat_user");
    dispatch({ type: "CLEAR_CART" });
  }, [dispatch]);

  // Token süresi dolduğunda apiClient buradan haber veriyor. Kullanıcı
  // düşünce korumalı rotalar zaten ProtectedRoute üzerinden /login'e
  // yönleniyor — burada ayrıca navigate etmeye gerek yok.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIsSessionExpired(true);
      clearSession();
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setIsSessionExpired(false);
    setUser(loggedInUser);
    sessionStorage.setItem("cineseat_user", JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (data) => {
    const registeredUser = await authService.register(data);
    setIsSessionExpired(false);
    setUser(registeredUser);
    sessionStorage.setItem("cineseat_user", JSON.stringify(registeredUser));
    return registeredUser;
  };

  const logout = () => {
    setIsSessionExpired(false);
    clearSession();
  };

  // İzinler backend'den geliyor (JWT claim'i → authService.mapAuthResult).
  // Burada rol tabanlı hiçbir varsayım yok: izin listesi neyse o geçerli.
  // useMemo, `hasPermission`ın menü/rota koruyucularının bağımlılık
  // listelerinde her render'da yeniden tetiklenmesini önlüyor.
  const value = useMemo(() => {
    const permissions = Array.isArray(user?.permissions)
      ? user.permissions
      : [];

    return {
      user,
      role: user?.role || "guest",
      isSessionExpired,
      permissions,
      hasPermission: (permission) => permissions.includes(permission),
      login,
      register,
      logout,
    };
    // login/register/logout her render'da yeniden oluşuyor ama kimlik
    // değişimleri yalnızca `user` üzerinden geldiği için bağımlılık odur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSessionExpired]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
