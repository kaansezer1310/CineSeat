import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import useCart from "../../hooks/useCart.js";
import useAuth from "../../hooks/useAuth.js";
import useTheme from "../../hooks/useTheme.js";
import PermissionGate from "../routing/PermissionGate.jsx";
import { ADMIN_PERMISSIONS } from "../../constants/permissions.js";

// Y4: aktif sayfa vurgusu NavLink üzerinden geliyor; NavLink eşleşen
// bağlantıya aria-current="page" da eklediği için ekran okuyucu da duyuyor.
function navigationLinkClass({ isActive }) {
  return isActive
    ? "main-navigation-link main-navigation-link-active"
    : "main-navigation-link";
}

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

        <nav className="main-navigation" aria-label="Ana menü">
          <NavLink to="/" end className={navigationLinkClass}>
            Vizyondaki Filmler
          </NavLink>

          {/* T9: sinemalar artık ana sayfada sekme değil, kendi rotası. */}
          <NavLink to="/cinemas" className={navigationLinkClass}>
            Sinemalar
          </NavLink>

          {/* K2: yönetim paneline arayüzden giriş. Rol sabiti yerine izinlere
              bakılır (T5) — yetkisi olmayanda bağlantı hiç render edilmez. */}
          <PermissionGate permissions={ADMIN_PERMISSIONS} mode="any">
            <NavLink to="/admin" className={navigationLinkClass}>
              Yönetim
            </NavLink>
          </PermissionGate>

          {user ? (
            <>
              <span className="main-navigation-greeting">
                Hoşgeldin, {user.name}
              </span>

              <NavLink to="/profile" className={navigationLinkClass}>
                Profilim
              </NavLink>

              <button
                type="button"
                onClick={logout}
                className="main-navigation-logout"
              >
                Çıkış
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navigationLinkClass}>
                Giriş Yap
              </NavLink>

              <NavLink to="/register" className={navigationLinkClass}>
                Kayıt Ol
              </NavLink>
            </>
          )}

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `${navigationLinkClass({ isActive })} cart-navigation-link`
            }
          >
            Sepet

            <span className="cart-count">
              {totalTicketCount}
            </span>
          </NavLink>

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
            {/* Emoji yerine SVG: tema dugmesi metin degil ikon tasiyor,
                erisilebilir ad zaten aria-label'da. currentColor sayesinde
                iki temada da dogru renkte ciziliyor. */}
            {theme === "light" ? (
              <svg
                className="theme-toggle-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
                />
              </svg>
            ) : (
              <svg
                className="theme-toggle-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="12" cy="12" r="4.2" fill="currentColor" />
                <g
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6" />
                  <path d="M5.4 5.4l1.9 1.9M16.7 16.7l1.9 1.9M18.6 5.4l-1.9 1.9M7.3 16.7l-1.9 1.9" />
                </g>
              </svg>
            )}
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
