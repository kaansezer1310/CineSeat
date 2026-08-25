import { useEffect, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartProvider from "../context/CartProvider.jsx";
import AuthProvider from "../context/AuthProvider.jsx";
import ToastProvider from "../context/ToastProvider.jsx";
import useCart from "../hooks/useCart.js";
import seatService from "../services/seatService.js";
import reservationService from "../services/reservationService.js";
import campaignService from "../services/campaignService.js";
import paymentAdapter from "../services/paymentAdapter.js";
import PaymentPage from "./PaymentPage.jsx";

vi.mock("../services/seatService.js", () => ({
  default: {
    lockSeats: vi.fn(),
    releaseLocks: vi.fn(),
    renewLocks: vi.fn(),
    getShowtimeSeatMap: vi.fn(),
  },
}));

vi.mock("../services/reservationService.js", () => ({
  default: { createReservation: vi.fn() },
}));

vi.mock("../services/campaignService.js", () => ({
  default: {
    getActiveCampaigns: vi.fn(),
    pickBestCampaign: vi.fn(() => null),
    calculateDiscount: vi.fn(() => 0),
  },
}));

vi.mock("../services/paymentAdapter.js", async () => {
  const actual = await vi.importActual("../services/paymentAdapter.js");

  return {
    ...actual,
    default: { name: "test", isSimulated: true, charge: vi.fn() },
  };
});

const CART_ITEM = {
  id: "session-91",
  sessionId: 91,
  movieId: 7,
  movieTitle: "The Odyssey",
  date: "2 Eylül",
  time: "20:00",
  hallName: "Salon 1",
  unitPrice: 260,
  seats: [{ seatId: 11, seatLabel: "A1", ticketType: "ADULT" }],
};

/**
 * Sepeti doldurup ANCAK ondan sonra çocukları render eder.
 *
 * PaymentPage boş sepette hemen /cart'a yönleniyor; sepeti aynı render
 * turunda doldurmak yetmiyor, sayfanın dolu sepetle mount olması gerekiyor.
 */
function WithSeededCart({ children }) {
  const { state, dispatch } = useCart();
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    dispatch({ type: "ADD_TICKET", payload: CART_ITEM });
  }, [dispatch]);

  if (!hasSeeded && state.items.length > 0) {
    setHasSeeded(true);
  }

  // Bir kez doldurulduktan sonra rotalar açık kalır: başarılı ödemede sepet
  // temizleniyor, sarmalayıcı yeniden gizlerse /success görülemezdi.
  return hasSeeded ? children : null;
}

function renderPaymentPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  sessionStorage.setItem(
    "cineseat_user",
    JSON.stringify({
      id: 1,
      firstName: "Ömer",
      lastName: "Faruk",
      email: "omer@cineseat.com",
      role: "member",
    })
  );

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/payment"]}>
        <CartProvider>
          <AuthProvider>
            <ToastProvider>
              <WithSeededCart>
                <Routes>
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/success" element={<p>Başarı sayfası</p>} />
                  <Route path="/payment-error" element={<p>Hata sayfası</p>} />
                  <Route path="/cart" element={<p>Sepet sayfası</p>} />
                </Routes>
              </WithSeededCart>
            </ToastProvider>
          </AuthProvider>
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

async function fillValidCard() {
  fireEvent.change(await screen.findByLabelText(/Kart Sahibinin Adı/), {
    target: { value: "Ömer Faruk" },
  });
  fireEvent.change(screen.getByLabelText(/Kart Numarası/), {
    target: { value: "4111111111111111" },
  });
  fireEvent.change(screen.getByLabelText(/Son Kullanma/), {
    target: { value: "1228" },
  });
  fireEvent.change(screen.getByLabelText(/CVV/), {
    target: { value: "123" },
  });
}

describe("PaymentPage — ödeme simülasyonu (T6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    seatService.lockSeats.mockResolvedValue([
      {
        id: 501,
        seatId: 11,
        lockExpiresAt: new Date(Date.now() + 600000).toISOString(),
      },
    ]);
    seatService.releaseLocks.mockResolvedValue(undefined);
    campaignService.getActiveCampaigns.mockResolvedValue([]);
    reservationService.createReservation.mockResolvedValue([
      { id: 1, resNo: "RES-1", total: 260, tickets: [{ id: 1 }] },
    ]);
    paymentAdapter.charge.mockResolvedValue({
      status: "approved",
      reference: "SIM-1",
      last4: "1111",
    });
  });

  it("demo ödeme olduğunu açıkça belirtir", async () => {
    renderPaymentPage();

    expect(await screen.findByText(/demo ödemedir/i)).toBeInTheDocument();
  });

  it("kart numarasını yazarken gruplar", async () => {
    renderPaymentPage();

    const input = await screen.findByLabelText(/Kart Numarası/);
    fireEvent.change(input, { target: { value: "4111111111111111" } });

    await waitFor(() => {
      expect(input).toHaveValue("4111 1111 1111 1111");
    });
  });

  it("geçersiz kartta ödeme çağrısı yapmaz, alan hatası gösterir", async () => {
    renderPaymentPage();

    await screen.findByLabelText(/Kart Numarası/);

    fireEvent.change(screen.getByLabelText(/Kart Sahibinin Adı/), {
      target: { value: "Ömer Faruk" },
    });
    fireEvent.change(screen.getByLabelText(/Kart Numarası/), {
      target: { value: "4111111111111112" },
    });
    fireEvent.change(screen.getByLabelText(/Son Kullanma/), {
      target: { value: "1228" },
    });
    fireEvent.change(screen.getByLabelText(/CVV/), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Öde/ }));

    expect(
      await screen.findByText(/Kart numarası geçersiz/)
    ).toBeInTheDocument();
    expect(paymentAdapter.charge).not.toHaveBeenCalled();
  });

  it("hatalı alanı aria-invalid ile işaretler", async () => {
    renderPaymentPage();

    await screen.findByLabelText(/CVV/);
    fireEvent.change(screen.getByLabelText(/CVV/), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Öde/ }));

    await waitFor(() => {
      expect(screen.getByLabelText(/CVV/)).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });
  });

  it("onaylanan ödemede rezervasyon oluşturur", async () => {
    renderPaymentPage();
    await fillValidCard();

    fireEvent.click(screen.getByRole("button", { name: /Öde/ }));

    await waitFor(() => {
      expect(paymentAdapter.charge).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(reservationService.createReservation).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText("Başarı sayfası")).toBeInTheDocument();
  });

  it("KART VERİSİNİ rezervasyon isteğine koymaz", async () => {
    renderPaymentPage();
    await fillValidCard();

    fireEvent.click(screen.getByRole("button", { name: /Öde/ }));

    await waitFor(() => {
      expect(reservationService.createReservation).toHaveBeenCalled();
    });

    const payload = JSON.stringify(
      reservationService.createReservation.mock.calls[0][0]
    );

    expect(payload).not.toContain("4111");
    expect(payload).not.toContain("12/28");
  });

  it("kart verisini tarayıcı depolamasına yazmaz", async () => {
    renderPaymentPage();
    await fillValidCard();

    fireEvent.click(screen.getByRole("button", { name: /Öde/ }));

    await waitFor(() => {
      expect(paymentAdapter.charge).toHaveBeenCalled();
    });

    const stored = [
      ...Object.keys(sessionStorage).map((key) => sessionStorage.getItem(key)),
      ...Object.keys(localStorage).map((key) => localStorage.getItem(key)),
    ].join("|");

    expect(stored).not.toContain("4111");
    expect(stored).not.toContain("1111111111");
  });

  it("reddedilen kartta hata sayfasına gider, rezervasyon oluşturmaz", async () => {
    paymentAdapter.charge.mockResolvedValue({
      status: "declined",
      reason: "Kartınız banka tarafından reddedildi.",
    });

    renderPaymentPage();
    await fillValidCard();

    fireEvent.click(screen.getByRole("button", { name: /Öde/ }));

    expect(await screen.findByText("Hata sayfası")).toBeInTheDocument();
    expect(reservationService.createReservation).not.toHaveBeenCalled();
  });

  it("teknik hatada sayfada kalır ve tekrar denenebilir", async () => {
    // Sağlayıcıya ulaşılamadıysa aynı kartla tekrar denemek mantıklı;
    // reddedilmede ise başka kart gerekir. İkisi bilerek ayrı ele alınıyor.
    paymentAdapter.charge.mockRejectedValue(
      new Error("Ödeme sağlayıcısına ulaşılamadı.")
    );

    renderPaymentPage();
    await fillValidCard();

    fireEvent.click(screen.getByRole("button", { name: /Öde/ }));

    expect(
      await screen.findByText("Ödeme sağlayıcısına ulaşılamadı.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Kart Numarası/)).toBeInTheDocument();
  });

  it("çift tıklamada tek ödeme çağrısı yapar", async () => {
    renderPaymentPage();
    await fillValidCard();

    const submit = screen.getByRole("button", { name: /Öde/ });
    fireEvent.click(submit);
    fireEvent.click(submit);

    await waitFor(() => {
      expect(paymentAdapter.charge).toHaveBeenCalledTimes(1);
    });
  });
});
