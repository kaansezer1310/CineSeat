import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-cols">
          <div className="site-footer-brand">
            <p className="site-footer-logo">CineSeat</p>
            <p className="site-footer-about">
              Türkiye&apos;nin dört bir yanındaki sinemalardan bilet al,
              koltuğunu önceden seç, kuyrukta bekleme.
            </p>
          </div>

          <div className="site-footer-col">
            <h2 className="site-footer-heading">Keşfet</h2>
            <ul className="site-footer-list">
              <li>
                <Link to="/movies">Vizyondaki Filmler</Link>
              </li>
              <li>
                <Link to="/cinemas">Sinemalar</Link>
              </li>
              <li>
                <Link to="/campaigns">Kampanyalar</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h2 className="site-footer-heading">Kurumsal</h2>
            <ul className="site-footer-list">
              <li>
                <Link to="/about">Hakkımızda</Link>
              </li>
              <li>
                <Link to="/contact">İletişim</Link>
              </li>
              <li>
                <Link to="/faq">Sıkça Sorulan Sorular</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h2 className="site-footer-heading">Yasal</h2>
            <ul className="site-footer-list">
              <li>
                <Link to="/privacy">Gizlilik Politikası</Link>
              </li>
              <li>
                <Link to="/terms">Kullanım Koşulları</Link>
              </li>
              <li>
                <Link to="/kvkk">KVKK Aydınlatma Metni</Link>
              </li>
              <li>
                <Link to="/refund">İptal ve İade</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bar">
          <span>© {currentYear} CineSeat. Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
