import { useState } from "react";
import ThemeContext from "./ThemeContext.js";

/**
 * Sprint 3 / 1.5.9 — Light / Dark mod (REQ-23)
 *
 * Varsayılan: dark (mevcut tasarım dark tema)
 * Tema bilgisi localStorage'da saklanır.
 * CSS: body'ye `data-theme="light"` veya `data-theme="dark"` attr eklenir.
 */
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("cineseat_theme");
    return stored === "light" ? "light" : "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("cineseat_theme", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
