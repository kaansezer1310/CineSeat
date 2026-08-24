import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import useCart from "../../hooks/useCart.js";
import useAuth from "../../hooks/useAuth.js";
import useTheme from "../../hooks/useTheme.js";
import { ADMIN_PANEL_PERMISSIONS } from "../../domain/permissions.js";

// Y4: aktif sayfa vurgusu NavLink üzerinden geliyor; NavLink eşleşen
// bağlantıya aria-current="page" da eklediği için ekran okuyucu da duyuyor.
function navigationLinkClass({ isActive }) {
  return isActive
    ? "main-navigation-link main-navigation-link-active"
    : "main-navigation-link";
}

function Layout() {
  const { state } = useCart();
  const { user, logout, canAny } = useAuth();
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

  // K2: yönetim paneline arayüzden giriş. Rol sabiti yerine izinlere bakılır
  // (T5) — yetkisi olmayan kullanıcıda bağlantı hiç render edilmez.
  const canSeeAdminPanel = canAny(ADMIN_PANEL_PERMISSIONS);

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

          {canSeeAdminPanel && (
            <NavLink to="/admin" className={navigationLinkClass}>
              Yönetim
            </NavLink>
          )}

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
