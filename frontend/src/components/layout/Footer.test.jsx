import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Footer from "./Footer.jsx";

function renderFooter() {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer", () => {
  it("marka adını ve tanıtım metnini gösterir", () => {
    renderFooter();

    expect(screen.getByText("CineSeat")).toBeInTheDocument();
    expect(
      screen.getByText(/koltuğunu önceden seç/)
    ).toBeInTheDocument();
  });

  it("Keşfet sütununda mevcut rotalara bağlantı verir", () => {
    renderFooter();

    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("href", "/cinemas");
    expect(
      screen.getByRole("link", { name: "Vizyondaki Filmler" })
    ).toHaveAttribute("href", "/movies");
  });

  it("Kurumsal ve Yasal sütunlarını başlıklarıyla gösterir", () => {
    renderFooter();

    expect(screen.getByText("Kurumsal")).toBeInTheDocument();
    expect(screen.getByText("Yasal")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Gizlilik Politikası" })
    ).toHaveAttribute("href", "/privacy");
  });

  it("geçerli yılla telif satırını gösterir", () => {
    renderFooter();

    const currentYear = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} CineSeat`))
    ).toBeInTheDocument();
  });
});
