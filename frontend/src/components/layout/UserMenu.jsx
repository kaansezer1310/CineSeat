import { Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import useDismissableOverlay from "../../hooks/useDismissableOverlay.js";

function UserMenu() {
  const { user, logout } = useAuth();
  const { isOpen, toggle, close, containerRef } = useDismissableOverlay();

  if (!user) {
    return (
      <div className="user-menu-guest">
        <Link to="/login" className="btn btn--ghost btn--sm">
          Giriş Yap
        </Link>
        <Link to="/register" className="btn btn--primary btn--sm">
          Kayıt Ol
        </Link>
      </div>
    );
  }

  function handleLogout() {
    close();
    logout();
  }

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="chip"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Hesap menüsü, ${user.name}`}
      >
        {user.name}
      </button>

      {isOpen && (
        <div className="dropdown-panel" role="menu">
          <Link
            to="/profile"
            className="dropdown-item"
            role="menuitem"
            onClick={close}
          >
            Profilim
          </Link>

          <button
            type="button"
            className="dropdown-item dropdown-item--danger"
            role="menuitem"
            onClick={handleLogout}
          >
            Çıkış
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
