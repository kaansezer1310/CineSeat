import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { clearStoredLocks } from "../services/seatLockStorage.js";
import PaymentErrorPage from "./PaymentErrorPage.jsx";

vi.mock("../services/seatLockStorage.js", () => ({
  clearStoredLocks: vi.fn(() => Promise.resolve()),
}));

function renderPaymentErrorPage(state) {
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/payment-error", state }]}
    >
      <Routes>
        <Route
          path="/payment-error"
          element={<PaymentErrorPage />}
        />
        <Route path="/payment" element={<p>Ödeme sayfası</p>} />
        <Route path="/cart" element={<p>Sepet sayfası</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PaymentErrorPage", () => {
  it("state'teki reddedilme sebebini gösterir", () => {
    renderPaymentErrorPage({ reason: "Kart limiti yetersiz." });

    expect(
      screen.getByText("Kart limiti yetersiz.")
    ).toBeInTheDocument();
  });

  it("sebep verilmemişse genel bir mesaj gösterir", () => {
    renderPaymentErrorPage(undefined);

    expect(
      screen.getByText("Kredi kartı işleminiz tamamlanamadı.")
    ).toBeInTheDocument();
  });

  it("'Tekrar Dene' /payment'e gider", async () => {
    renderPaymentErrorPage({ reason: "Kart reddedildi." });

    fireEvent.click(
      screen.getByRole("link", { name: "Tekrar Dene" })
    );

    expect(
      await screen.findByText("Ödeme sayfası")
    ).toBeInTheDocument();
  });

  it("'Sepete Dön' kilitleri temizler ve /cart'a gider", async () => {
    renderPaymentErrorPage({ reason: "Kart reddedildi." });

    fireEvent.click(
      screen.getByRole("button", { name: "Sepete Dön" })
    );

    expect(clearStoredLocks).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText("Sepet sayfası")
    ).toBeInTheDocument();
  });
});
