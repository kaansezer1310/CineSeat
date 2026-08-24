import { Link, useNavigate } from "react-router-dom";
import { clearStoredLocks } from "../services/seatLockStorage.js";

function PaymentErrorPage() {
  const navigate = useNavigate();

  // Ödeme başarısız oldu: koltuk kilitleri hemen bırakılır ki başkası
  // bekletilmesin. Kilit kimlikleri PaymentPage tarafından sessionStorage'a
  // yazılmıştı — bu sayfa ayrı bir rota olduğu için tek referans o.
  function handleReturnToCart() {
    clearStoredLocks();
    navigate("/cart");
  }

  return (
    <section>
      <div className="page-heading checkout-error">
        <h1>Ödeme Başarısız</h1>
        <p>Kredi kartı işleminiz banka tarafından reddedildi.</p>
        
        <div className="page-actions">
          <Link className="primary-button" to="/payment">
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
