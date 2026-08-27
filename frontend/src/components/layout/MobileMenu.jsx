import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import useDismissableOverlay from "../../hooks/useDismissableOverlay.js";
import PermissionGate from "../routing/PermissionGate.jsx";
import { ADMIN_PERMISSIONS } from "../../constants/permissions.js";

function mobileNavLinkClass({ isActive }) {
  return isActive
    ? "mobile-menu-link mobile-menu-link-active"
    : "mobile-menu-link";
}

function MobileMenu() {
  const { user, logout } = useAuth();
  const { isOpen, toggle, close } = useDismissableOverlay();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.style.overflow = "hidden";

    const focusable = panelRef.current?.querySelectorAll(
      'a[href], button:not([disabled])'
    );
    focusable?.[0]?.focus();

    function trapFocus(event) {
      if (event.key !== "Tab" || !focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", trapFocus);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", trapFocus);
    };
  }, [isOpen]);

  function handleLogout() {
    close();
    logout();
  }

  return (
    <>
      <button
        type="button"
        className="icon-btn mobile-menu-trigger"
        onClick={toggle}
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div className="mobile-menu-overlay" onClick={close}>
          <nav
            id="mobile-menu-panel"
            ref={panelRef}
            className="mobile-menu-panel"
            aria-label="Mobil menü"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="icon-btn mobile-menu-close"
              onClick={close}
              aria-label="Mobil menüyü kapat"
            >
              ✕
            </button>

            <NavLink to="/" end className={mobileNavLinkClass} onClick={close}>
              Filmler
            </NavLink>
            <NavLink
              to="/cinemas"
              className={mobileNavLinkClass}
              onClick={close}
            >
              Sinemalar
            </NavLink>
            <NavLink
              to="/campaigns"
              className={mobileNavLinkClass}
              onClick={close}
            >
              Kampanyalar
            </NavLink>

            <PermissionGate permissions={ADMIN_PERMISSIONS} mode="any">
              <NavLink
                to="/admin"
                className={mobileNavLinkClass}
                onClick={close}
              >
                Yönetim
              </NavLink>
            </PermissionGate>

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className={mobileNavLinkClass}
                  onClick={close}
                >
                  Profilim
                </NavLink>
                <button
                  type="button"
                  className="mobile-menu-link mobile-menu-logout"
                  onClick={handleLogout}
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={mobileNavLinkClass}
                  onClick={close}
                >
                  Giriş Yap
                </NavLink>
                <NavLink
                  to="/register"
                  className={mobileNavLinkClass}
                  onClick={close}
                >
                  Kayıt Ol
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

export default MobileMenu;
