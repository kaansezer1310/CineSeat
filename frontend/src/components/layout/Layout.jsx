import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";

import useCart from "../../hooks/useCart.js";
import useAuth from "../../hooks/useAuth.js";
import useTheme from "../../hooks/useTheme.js";

function Layout() {
  const { state } = useCart();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const totalTicketCount = state.items.reduce(
    (total, item) => {
      return total + item.seats.length;
    },
    0
  );

  return (
    <div className="app-shell">
      <header className="main-header">
        <Link className="logo" to="/">
          CineSeat
        </Link>

        <nav className="main-navigation">
          <Link to="/">Vizyondaki Filmler</Link>

          {user ? (
            <>
              <span style={{ color: "var(--color-header-text-muted)" }}>
                Hoşgeldin, {user.name}
              </span>
              <Link to="/profile">Profilim</Link>
              <button
                onClick={logout}
                style={{
                  background: "transparent",
                  color: "var(--color-header-accent)",
                  cursor: "pointer",
                }}
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Giriş Yap</Link>
              <Link to="/register">Kayıt Ol</Link>
            </>
          )}

          <Link
            className="cart-navigation-link"
            to="/cart"
          >
            Sepet

            <span className="cart-count">
              {totalTicketCount}
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            className="theme-toggle-button"
            title={
              theme === "light"
                ? "Koyu temaya geç"
                : "Açık temaya geç"
            }
            aria-label={
              theme === "light"
                ? "Koyu temaya geç"
                : "Açık temaya geç"
            }
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </nav>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;