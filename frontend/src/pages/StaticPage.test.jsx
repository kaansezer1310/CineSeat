import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import staticPages from "../data/staticPages.js";
import StaticPage from "./StaticPage.jsx";

function renderStaticPage(slug) {
  render(
    <MemoryRouter>
      <StaticPage slug={slug} />
    </MemoryRouter>
  );
}

describe("StaticPage", () => {
  it("sayfanın başlığını h1 olarak ve açıklamasını gösterir", () => {
    renderStaticPage("about");

    expect(
      screen.getByRole("heading", { level: 1, name: "Hakkımızda" })
    ).toBeInTheDocument();
    expect(screen.getByText(staticPages.about.lead)).toBeInTheDocument();
  });

  it("her bölümü kendi h2 başlığıyla render eder", () => {
    renderStaticPage("terms");

    staticPages.terms.sections.forEach((section) => {
      expect(
        screen.getByRole("heading", { level: 2, name: section.heading })
      ).toBeInTheDocument();
    });
  });

  it("madde listelerini gerçek liste öğeleri olarak render eder", () => {
    renderStaticPage("kvkk");

    const haklar = staticPages.kvkk.sections.find(
      (section) => section.list
    );

    haklar.list.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it("SSS'yi soruları açılıp kapanan details öğeleri olarak render eder", () => {
    renderStaticPage("faq");

    const soru = staticPages.faq.sections[0];
    const summary = screen.getByText(soru.heading);

    // <details>/<summary> yerlisi: klavye desteği ücretsiz gelir, JS yok.
    expect(summary.tagName).toBe("SUMMARY");
    expect(summary.closest("details")).not.toBeNull();
    expect(summary.closest("details")).not.toHaveAttribute("open");
  });

  it("iletişim sayfasında bilgileri tanım listesi olarak gösterir", () => {
    renderStaticPage("contact");

    staticPages.contact.details.forEach((detail) => {
      const term = screen.getByText(detail.label);

      expect(term.tagName).toBe("DT");
      expect(screen.getByText(detail.value)).toBeInTheDocument();
    });
  });

  it("her sayfanın altında iletişim bağlantısı verir", () => {
    renderStaticPage("privacy");

    const note = screen.getByText(/Aradığını bulamadın mı/);

    expect(
      within(note.parentElement).getByRole("link", { name: "Bize ulaş" })
    ).toHaveAttribute("href", "/contact");
  });

  it("tanınmayan slug için 404 sayfasını gösterir", () => {
    renderStaticPage("bilinmeyen-sayfa");

    expect(
      screen.getByRole("heading", { level: 1, name: "Sayfa bulunamadı" })
    ).toBeInTheDocument();
  });

  it("Footer'ın bağlandığı yedi slug'ın tamamı içerik verisinde tanımlı", () => {
    // Footer/Header ölü linke gitmesin: rota listesiyle veri tek elden
    // doğrulanır.
    ["about", "contact", "faq", "privacy", "terms", "kvkk", "refund"].forEach(
      (slug) => {
        expect(staticPages[slug]).toBeDefined();
        expect(staticPages[slug].sections.length).toBeGreaterThan(0);
      }
    );
  });
});
