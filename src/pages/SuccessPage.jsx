import {
  Link,
  useLocation,
} from "react-router-dom";

function SuccessPage() {
  const location = useLocation();

  const reservation =
    location.state?.reservation;

  return (
    <section className="success-page">
      <div className="success-icon">✓</div>

      <h1>Rezervasyon tamamlandı</h1>

      <p>
        Seçtiğin koltuklar başarıyla kaydedildi ve
        artık ilgili seanslarda dolu görünecek.
      </p>

      {reservation && (
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
            <span>Ödenen toplam</span>
            <strong>
              {reservation.totalPrice} TL
            </strong>
          </div>
        </div>
      )}

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