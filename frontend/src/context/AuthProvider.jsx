import { useMemo, useState } from "react";
import AuthContext from "./AuthContext.js";
import { authService } from "../services/authService.js";
import useCart from "../hooks/useCart.js";
import {
  hasAnyPermission,
  hasPermission,
  resolvePermissions,
} from "../domain/permissions.js";

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

  // İzin türevleri her render'da yeniden hesaplanmasın diye memolanıyor;
  // `can`/`canAny` menü ve rota koruyucularının bağımlılık listelerine giriyor.
  const value = useMemo(
    () => ({
      user,
      role: user?.role || "guest",
      permissions: resolvePermissions(user),
      can: (permission) => hasPermission(user, permission),
      canAny: (permissions) => hasAnyPermission(user, permissions),
      login,
      register,
      logout,
    }),
    // login/register/logout her render'da yeniden oluşuyor ama kimlik
    // değişimleri yalnızca `user` üzerinden geldiği için bağımlılık odur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
