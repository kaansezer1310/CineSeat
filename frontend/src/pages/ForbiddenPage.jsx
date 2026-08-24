import { Link, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth.js";

/**
 * 403 — giriş yapmış ama yetkisi olmayan kullanıcıya gösterilir.
 * Y2'nin ikinci yarısı: kullanıcı neden yönlendirildiğini burada öğrenir.
 */
function ForbiddenPage() {
  const location = useLocation();
  const { user } = useAuth();

  const attemptedPath = location.state?.from?.pathname;

  return (
    <section>
      <div className="page-heading">
        <h1>Bu sayfaya erişim izniniz yok</h1>

        <p>
          {attemptedPath
            ? `${attemptedPath} adresi için gereken yetkiye sahip değilsiniz.`
            : "İstediğiniz sayfa için gereken yetkiye sahip değilsiniz."}{" "}
          {user
            ? "Erişim gerekiyorsa yöneticinizden yetki talep edebilirsiniz."
            : "Farklı bir hesapla giriş yapmayı deneyebilirsiniz."}
        </p>
      </div>

      <div className="page-actions">
        <Link className="primary-button" to="/">
          Ana Sayfaya Dön
        </Link>

        {!user && (
          <Link className="secondary-button" to="/login">
            Giriş Yap
          </Link>
        )}
      </div>
    </section>
  );
}

export default ForbiddenPage;
