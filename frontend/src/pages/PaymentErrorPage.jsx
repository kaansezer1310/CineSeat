import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearStoredLocks } from "../services/seatLockStorage.js";

function PaymentErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ödeme adaptörü ret sebebini taşır ("kart reddedildi" gibi). Sebep yoksa
  // genel bir mesaj gösterilir — sayfa doğrudan açılmış olabilir.
  const reason = location.state?.reason;

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
        <p>{reason ?? "Kredi kartı işleminiz tamamlanamadı."}</p>

        <p className="payment-error-hint">
          Koltuk kilitleriniz bırakıldı. Sepetiniz duruyor; başka bir kartla
          yeniden deneyebilirsiniz.
        </p>
        
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
