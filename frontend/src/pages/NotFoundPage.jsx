import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section>
      <div className="page-heading">
        <h1>Sayfa bulunamadı</h1>

        <p>
          Aradığın sayfa henüz yok ya da taşınmış olabilir.
          Ana sayfaya dönerek filmleri inceleyebilirsin.
        </p>
      </div>

      <Link className="primary-button" to="/">
        Ana Sayfaya Dön
      </Link>
    </section>
  );
}

export default NotFoundPage;
