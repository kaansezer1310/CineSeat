import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import useTheme from "../../hooks/useTheme.js";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

function Layout() {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        İçeriğe geç
      </a>

      <Header />

      <main id="main-content" className="container">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
