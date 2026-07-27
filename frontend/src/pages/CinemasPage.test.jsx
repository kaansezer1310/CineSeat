import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

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

  it("onViewSessions verilmişse 'Seansları Gör' tıklanınca onu çağırır", async () => {
    const onViewSessions = vi.fn();

    render(
      <MemoryRouter>
        <CinemasPage onViewSessions={onViewSessions} />
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

    expect(onViewSessions).toHaveBeenCalledTimes(1);
  });

  it("onViewSessions verilmemişse 'Seansları Gör' ana sayfaya yönlendirir", async () => {
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
