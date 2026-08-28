import { Link, NavLink } from "react-router-dom";

import CartButton from "./CartButton.jsx";
import CitySelector from "./CitySelector.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import UserMenu from "./UserMenu.jsx";
import PermissionGate from "../routing/PermissionGate.jsx";
import { ADMIN_PERMISSIONS } from "../../constants/permissions.js";

import "./Header.css";

function navLinkClass({ isActive }) {
  return isActive
    ? "header-nav-link header-nav-link-active"
    : "header-nav-link";
}

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo">
          CineSeat
        </Link>

        <nav className="site-nav" aria-label="Ana menü">
          <NavLink to="/movies" className={navLinkClass}>
            Filmler
          </NavLink>
          <NavLink to="/cinemas" className={navLinkClass}>
            Sinemalar
          </NavLink>
          <NavLink to="/campaigns" className={navLinkClass}>
            Kampanyalar
          </NavLink>

          <PermissionGate permissions={ADMIN_PERMISSIONS} mode="any">
            <NavLink to="/admin" className={navLinkClass}>
              Yönetim
            </NavLink>
          </PermissionGate>
        </nav>

        <div className="site-header-tools">
          <CitySelector />
          <UserMenu />
        </div>

        <div className="site-header-quick-actions">
          <CartButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
