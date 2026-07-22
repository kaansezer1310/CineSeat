import { createContext, useState, useContext } from "react";

/**
 * Sprint 3 / 1.5.9 — Light / Dark mod (REQ-23)
 *
 * Varsayılan: dark (mevcut tasarım dark tema)
 * Tema bilgisi localStorage'da saklanır.
 * CSS: body'ye `data-theme="light"` veya `data-theme="dark"` attr eklenir.
 */

const ThemeContext = createContext(null);

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

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { ThemeProvider, useTheme };
export default ThemeContext;
