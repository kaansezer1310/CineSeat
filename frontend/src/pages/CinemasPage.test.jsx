import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import CinemasPage from "./CinemasPage.jsx";

describe("CinemasPage", () => {
  it("şehir adının yanında konum emojisi göstermez", async () => {
    render(
      <MemoryRouter>
        <CinemasPage />
      </MemoryRouter>
    );

    const cityTexts = await screen.findAllByText("İstanbul", {
      selector: ".cinema-city",
    });

    expect(cityTexts.length).toBeGreaterThan(0);
    cityTexts.forEach((cityText) => {
      expect(cityText.textContent).toBe("İstanbul");
    });
  });

  // T9: sayfa ana sayfada sekme olmaktan çıkıp kendi rotası olduğu için
  // başlığını artık kendisi render ediyor.
  it("kendi sayfa başlığını gösterir", async () => {
    render(
      <MemoryRouter>
        <CinemasPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Sinemalarımız",
      })
    ).toBeInTheDocument();
  });

  it("'Seansları Gör' kullanıcıyı ana sayfaya yönlendirir", async () => {
    render(
      <MemoryRouter initialEntries={["/cinemas"]}>
        <Routes>
          <Route path="/" element={<div>Ana sayfa</div>} />
          <Route path="/cinemas" element={<CinemasPage />} />
        </Routes>
      </MemoryRouter>
    );

    const firstCard = (
      await screen.findAllByRole("heading", { level: 3 })
    )[0].closest(".cinema-card");

    fireEvent.click(
      within(firstCard).getByRole("button", {
        name: "Seansları Gör",
      })
    );

    expect(
      await screen.findByText("Ana sayfa")
    ).toBeInTheDocument();
  });
});
