import { Link } from "react-router-dom";

function PaymentErrorPage() {
  return (
    <section>
      <div className="page-heading checkout-error">
        <h1>Ödeme Başarısız</h1>
        <p>Kredi kartı işleminiz banka tarafından reddedildi.</p>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          <Link className="primary-button" to="/odeme">
            Tekrar Dene
          </Link>
          <Link className="secondary-button" to="/cart">
            Sepete Dön
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PaymentErrorPage;
