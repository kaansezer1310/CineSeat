import { useState } from "react";
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

  const value = {
    user,
    role: user?.role || "guest",
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
