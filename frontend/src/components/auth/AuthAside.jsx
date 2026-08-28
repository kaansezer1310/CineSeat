import heroPoster from "../../assets/hero.png";

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
      <img src={heroPoster} alt="" className="auth-aside-image" />

      <div className="auth-aside-content">
        <span className="auth-aside-eyebrow">CineSeat</span>

        <p className="auth-aside-title">{title}</p>

        <p className="auth-aside-text">{text}</p>
      </div>
    </aside>
  );
}

export default AuthAside;
