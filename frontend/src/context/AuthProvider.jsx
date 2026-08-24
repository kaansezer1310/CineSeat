import { useMemo, useState } from "react";
import AuthContext from "./AuthContext.js";
import { authService } from "../services/authService.js";
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

  const { dispatch } = useCart();

  const login = async (email, password) => {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    sessionStorage.setItem("cineseat_user", JSON.stringify(loggedInUser));
    return loggedInUser;
  };

  const register = async (data) => {
    const registeredUser = await authService.register(data);
    setUser(registeredUser);
    sessionStorage.setItem("cineseat_user", JSON.stringify(registeredUser));
    return registeredUser;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("cineseat_user");
    dispatch({ type: "CLEAR_CART" });
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
      permissions,
      hasPermission: (permission) => permissions.includes(permission),
      login,
      register,
      logout,
    };
    // login/register/logout her render'da yeniden oluşuyor ama kimlik
    // değişimleri yalnızca `user` üzerinden geldiği için bağımlılık odur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
