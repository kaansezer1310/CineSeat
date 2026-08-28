import { Link, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth.js";

import "./error-page.css";

/**
 * 403 — giriş yapmış ama yetkisi olmayan kullanıcıya gösterilir.
 * Y2'nin ikinci yarısı: kullanıcı neden yönlendirildiğini burada öğrenir.
 */
function ForbiddenPage() {
  const location = useLocation();
  const { user } = useAuth();

  const attemptedPath = location.state?.from?.pathname;

  return (
    <section className="error-page">
      <p className="error-page-code" aria-hidden="true">
        403
      </p>

      <h1 className="error-page-title">Bu sayfaya erişim izniniz yok</h1>

      <p className="error-page-description">
        {attemptedPath
          ? `${attemptedPath} adresi için gereken yetkiye sahip değilsiniz.`
          : "İstediğiniz sayfa için gereken yetkiye sahip değilsiniz."}{" "}
        {user
          ? "Erişim gerekiyorsa yöneticinizden yetki talep edebilirsiniz."
          : "Farklı bir hesapla giriş yapmayı deneyebilirsiniz."}
      </p>

      <div className="error-page-actions">
        <Link className="btn btn--primary btn--md" to="/">
          Ana Sayfaya Dön
        </Link>

        {!user && (
          <Link className="btn btn--secondary btn--md" to="/login">
            Giriş Yap
          </Link>
        )}
      </div>
    </section>
  );
}

export default ForbiddenPage;
