import { Link, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart.js";
import seatService from "../services/seatService.js";

function PaymentErrorPage() {
  const navigate = useNavigate();
  const { state } = useCart();

  function handleReturnToCart() {
    const lockToken = sessionStorage.getItem("cineseat_lock_token");
    if (lockToken) {
      state.items.forEach((item) => {
        seatService.releaseLockedSeats({
          sessionId: item.sessionId,
          seats: item.seats.map((seat) => seat.seatId),
          lockToken,
        });
      });
      sessionStorage.removeItem("cineseat_lock_token");
      sessionStorage.removeItem("cineseat_lock_expires");
    }
    navigate("/cart");
  }

  return (
    <section>
      <div className="page-heading checkout-error">
        <h1>Ödeme Başarısız</h1>
        <p>Kredi kartı işleminiz banka tarafından reddedildi.</p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <Link className="primary-button" to="/odeme">
            Tekrar Dene
          </Link>
          <button className="secondary-button" onClick={handleReturnToCart}>
            Sepete Dön
          </button>
        </div>
      </div>
    </section>
  );
}

export default PaymentErrorPage;
