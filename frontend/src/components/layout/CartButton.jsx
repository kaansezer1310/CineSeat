import { Link } from "react-router-dom";

import useCart from "../../hooks/useCart.js";

function CartButton() {
  const { state } = useCart();
  const totalTicketCount = state.items.reduce((total, item) => {
    return total + item.seats.length;
  }, 0);

  return (
    <Link to="/cart" className="icon-btn" aria-label="Sepet" title="Sepet">
      🛒
      {totalTicketCount > 0 && (
        <span className="icon-btn-badge">{totalTicketCount}</span>
      )}
    </Link>
  );
}

export default CartButton;
