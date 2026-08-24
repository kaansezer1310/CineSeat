import { Link, useLocation } from "react-router-dom";

import { formatPrice } from "../services/pricing.js";

// Rezervasyonlar artık backend'den dönüyor: sepetteki her seans için bir
// kayıt. Rezervasyon numarası (`resNo`) ve tutar sunucunun hesabıdır —
// istemcinin gönderdiği bir toplam yok.
function isValidReservation(reservation) {
  return (
    reservation !== null &&
    typeof reservation === "object" &&
    typeof reservation.resNo === "string" &&
    reservation.resNo.trim().length > 0 &&
    Array.isArray(reservation.tickets) &&
    Number.isFinite(reservation.total)
  );
}

function SuccessPage() {
  const location = useLocation();

  const reservations = location.state?.reservations;

  const isValid =
    Array.isArray(reservations) &&
    reservations.length > 0 &&
    reservations.every(isValidReservation);

  if (!isValid) {
    return (
      <section className="success-page">
        <h1>Rezervasyon bilgisi bulunamadı.</h1>

        <p>
          Bu sayfa doğrudan açılmış veya yenilenmiş olabilir. Geçmiş
          biletlerini profilinden görüntüleyebilirsin.
        </p>

        <div className="page-actions">
          <Link className="primary-button" to="/">
            Ana Sayfaya Dön
          </Link>

          <Link className="secondary-button" to="/profile">
            Biletlerim
          </Link>
        </div>
      </section>
    );
  }

  const totalTicketCount = reservations.reduce(
    (total, reservation) => total + reservation.tickets.length,
    0
  );

  const grandTotal = reservations.reduce(
    (total, reservation) => total + reservation.total,
    0
  );

  return (
    <section className="success-page">
      <div className="success-icon">✓</div>

      <h1>Rezervasyon tamamlandı</h1>

      <p>
        Seçtiğin koltuklar kaydedildi ve artık ilgili seanslarda dolu
        görünecek.
      </p>

      <div className="success-reservation-details">
        <div>
          <span>
            {reservations.length > 1
              ? "Rezervasyon numaraları"
              : "Rezervasyon numarası"}
          </span>
          <strong>
            {reservations.map((item) => item.resNo).join(", ")}
          </strong>
        </div>

        <div>
          <span>Bilet sayısı</span>
          <strong>{totalTicketCount}</strong>
        </div>

        <div>
          <span>Rezervasyon toplamı</span>
          <strong>{formatPrice(grandTotal)} TL</strong>
        </div>
      </div>

      <div className="page-actions">
        <Link className="primary-button" to="/">
          Ana Sayfaya Dön
        </Link>

        <Link className="secondary-button" to="/profile">
          Biletlerim
        </Link>
      </div>
    </section>
  );
}

export default SuccessPage;
