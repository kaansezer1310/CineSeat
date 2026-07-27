import {
  Link,
  useLocation,
} from "react-router-dom";

function isValidReservation(reservation) {
  return (
    reservation !== null &&
    typeof reservation === "object" &&
    typeof reservation.id === "string" &&
    reservation.id.trim().length > 0 &&
    Number.isInteger(reservation.ticketCount) &&
    reservation.ticketCount > 0 &&
    Number.isFinite(reservation.totalPrice) &&
    reservation.totalPrice >= 0
  );
}

function SuccessPage() {
  const location = useLocation();

  const reservation =
    location.state?.reservation;

  if (!isValidReservation(reservation)) {
    return (
      <section className="success-page">
        <h1>Rezervasyon bilgisi bulunamadı.</h1>

        <p>
          Bu sayfa doğrudan açılmış veya yenilenmiş
          olabilir. Yeni bir rezervasyon oluşturmak için
          ana sayfaya dönebilirsin.
        </p>

        <Link
          className="primary-button"
          to="/"
        >
          Ana Sayfaya Dön
        </Link>
      </section>
    );
  }

  return (
    <section className="success-page">
      <div className="success-icon">✓</div>

      <h1>Rezervasyon tamamlandı</h1>

      <p>
        Seçtiğin koltuklar başarıyla kaydedildi ve
        artık ilgili seanslarda dolu görünecek.
      </p>

      <div className="success-reservation-details">
        <div>
          <span>Rezervasyon numarası</span>
          <strong>{reservation.id}</strong>
        </div>

        <div>
          <span>Bilet sayısı</span>
          <strong>
            {reservation.ticketCount}
          </strong>
        </div>

        <div>
          <span>Rezervasyon toplamı</span>
          <strong>
            {reservation.totalPrice} TL
          </strong>
        </div>
      </div>

      <Link
        className="primary-button"
        to="/"
      >
        Ana Sayfaya Dön
      </Link>
    </section>
  );
}

export default SuccessPage;