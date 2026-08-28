import { Link } from "react-router-dom";

import "./error-page.css";

function NotFoundPage() {
  return (
    <section className="error-page">
      <p className="error-page-code" aria-hidden="true">
        404
      </p>

      <h1 className="error-page-title">Sayfa bulunamadı</h1>

      <p className="error-page-description">
        Aradığın sayfa henüz yok ya da taşınmış olabilir. Vizyondaki filmlere
        göz atarak devam edebilirsin.
      </p>

      <div className="error-page-actions">
        <Link className="btn btn--primary btn--md" to="/">
          Ana Sayfaya Dön
        </Link>

        <Link className="btn btn--secondary btn--md" to="/movies">
          Filmleri İncele
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
