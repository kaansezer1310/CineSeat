import {
  Link,
  Outlet,
} from "react-router-dom";

import useCart from "../../hooks/useCart.js";

function Layout() {
  const { state } = useCart();

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

          <Link
            className="cart-navigation-link"
            to="/cart"
          >
            Sepet

            <span className="cart-count">
              {totalTicketCount}
            </span>
          </Link>
        </nav>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;