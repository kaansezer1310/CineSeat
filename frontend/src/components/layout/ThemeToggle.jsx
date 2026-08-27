import useTheme from "../../hooks/useTheme.js";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "light" ? "Koyu temaya geç" : "Açık temaya geç";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="icon-btn"
      title={label}
      aria-label={label}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

export default ThemeToggle;
