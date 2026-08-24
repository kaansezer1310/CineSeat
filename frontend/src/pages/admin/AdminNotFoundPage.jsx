import { Link } from "react-router-dom";

/**
 * O5: yönetim panelindeki bilinmeyen adresler kullanıcıyı admin kabuğundan
 * atmak yerine burada karşılar — kenar çubuğu ve üst çubuk yerinde kalır.
 */
export default function AdminNotFoundPage() {
  return (
    <div className="admin-not-found">
      <div className="admin-header">
        <h1>Yönetim sayfası bulunamadı</h1>
      </div>

      <p className="admin-empty-text">
        Aradığınız yönetim ekranı yok ya da adresi değişmiş olabilir.
        Soldaki menüden devam edebilirsiniz.
      </p>

      <Link to="/admin" className="admin-btn admin-btn-primary">
        İstatistiklere Dön
      </Link>
    </div>
  );
}
