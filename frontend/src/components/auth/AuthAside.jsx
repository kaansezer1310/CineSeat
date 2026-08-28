// Gerçek, ücretsiz lisanslı (Unsplash License) bir sinema salonu fotoğrafı —
// yerel bir dosya olarak depoya kopyalanmak yerine doğrudan bağlanıyor.
const AUTH_ASIDE_PHOTO_URL =
  "https://images.unsplash.com/photo-1722321974528-ec8eaf725777?q=80&w=1200&auto=format&fit=crop";

/**
 * Faz 4 — Giriş/Kayıt sayfalarının sağındaki dekoratif marka paneli
 * (spec §8: "bölünmüş düzen — solda form, sağda poster kolajı").
 *
 * Tamamen dekoratif olduğu için `aria-hidden`: ekran okuyucu kullanıcısı
 * için buradaki metin, formu bulmadan önce aşılması gereken gereksiz bir
 * engel olurdu. Dar ekranda CSS ile hiç gösterilmez.
 */
function AuthAside({ title, text }) {
  return (
    <aside className="auth-aside" aria-hidden="true">
      <img
        src={AUTH_ASIDE_PHOTO_URL}
        alt=""
        className="auth-aside-image"
      />

      <div className="auth-aside-content">
        <span className="auth-aside-eyebrow">CineSeat</span>

        <p className="auth-aside-title">{title}</p>

        <p className="auth-aside-text">{text}</p>
      </div>
    </aside>
  );
}

export default AuthAside;
