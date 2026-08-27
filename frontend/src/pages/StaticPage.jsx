import { Link } from "react-router-dom";

import PageHeader from "../components/ui/PageHeader.jsx";
import staticPages from "../data/staticPages.js";
import NotFoundPage from "./NotFoundPage.jsx";

import "./static-page.css";

/**
 * Faz 4 — /about, /contact, /faq, /privacy, /terms, /kvkk, /refund
 * sayfalarının tamamının paylaştığı kabuk (spec §7).
 *
 * İçerik `data/staticPages.js`'te; burada yalnızca üç sunum biçimi var:
 * normal metin bölümleri, SSS akordeonu (`variant: "faq"`) ve iletişim
 * bilgileri tanım listesi (`variant: "contact"`).
 */

function SectionBody({ section }) {
  return (
    <>
      {section.body?.map((paragraph) => (
        <p key={paragraph} className="static-page-paragraph">
          {paragraph}
        </p>
      ))}

      {section.list && (
        <ul className="static-page-list">
          {section.list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </>
  );
}

function StaticPage({ slug }) {
  const page = staticPages[slug];

  // Rotalar App.jsx'te sabit yazıldığı için bu normalde imkânsız; yine de
  // sessizce boş bir sayfa render etmek yerine 404'e düşüyoruz.
  if (!page) {
    return <NotFoundPage />;
  }

  const isFaq = page.variant === "faq";

  return (
    <article className="static-page">
      <PageHeader title={page.title} description={page.lead} />

      {page.variant === "contact" && (
        <dl className="static-page-contact card">
          {page.details.map((detail) => (
            <div key={detail.label} className="static-page-contact-row">
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className={isFaq ? "static-page-faq" : "static-page-sections"}>
        {page.sections.map((section) =>
          isFaq ? (
            // <details>/<summary> yerlisi: klavye ve ekran okuyucu desteği
            // hazır gelir, açma/kapama için JS gerekmez.
            <details key={section.heading} className="static-page-faq-item">
              <summary className="static-page-faq-question">
                {section.heading}
              </summary>

              <div className="static-page-faq-answer">
                <SectionBody section={section} />
              </div>
            </details>
          ) : (
            <section key={section.heading} className="static-page-section">
              <h2 className="static-page-section-title">{section.heading}</h2>

              <SectionBody section={section} />
            </section>
          )
        )}
      </div>

      <div className="static-page-footer-note">
        <p>
          Aradığını bulamadın mı?{" "}
          <Link to="/contact" className="static-page-link">
            Bize ulaş
          </Link>
          .
        </p>
      </div>
    </article>
  );
}

export default StaticPage;
