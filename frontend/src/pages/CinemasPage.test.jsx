import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import cinemaService from "../services/cinemaService.js";
import CinemasPage from "./CinemasPage.jsx";

vi.mock("../services/cinemaService.js", () => ({
  default: {
    getCinemas: vi.fn(),
  },
}));

const CINEMAS = [
  {
    id: 1,
    name: "CineSeat Kadıköy",
    address: "Bahariye Cd. 1",
    city: "İstanbul",
    lat: 40.9819,
    lng: 29.0233,
  },
  {
    id: 2,
    name: "CineSeat Çankaya",
    address: "Tunalı Hilmi Cd. 5",
    city: "Ankara",
    lat: 39.9208,
    lng: 32.8541,
  },
];

function renderCinemasPage(routes = false) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/cinemas"]}>
        {routes ? (
          <Routes>
            <Route path="/" element={<div>Ana sayfa</div>} />
            <Route path="/cinemas" element={<CinemasPage />} />
          </Routes>
        ) : (
          <CinemasPage />
        )}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("CinemasPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cinemaService.getCinemas.mockResolvedValue(CINEMAS);
  });

  it("sinemaları gerçek servisten okur", async () => {
    renderCinemasPage();

    expect(
      await screen.findByText("CineSeat Kadıköy")
    ).toBeInTheDocument();
    expect(cinemaService.getCinemas).toHaveBeenCalled();
  });

  it("şehir adının yanında konum emojisi göstermez", async () => {
    renderCinemasPage();

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
    renderCinemasPage();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Sinemalarımız",
      })
    ).toBeInTheDocument();
  });

  it("şehir filtresi listeyi daraltır", async () => {
    renderCinemasPage();

    await screen.findByText("CineSeat Kadıköy");

    fireEvent.change(screen.getByLabelText(/Şehir Seçin/), {
      target: { value: "Ankara" },
    });

    expect(screen.getByText("CineSeat Çankaya")).toBeInTheDocument();
    expect(
      screen.queryByText("CineSeat Kadıköy")
    ).not.toBeInTheDocument();
  });

  it("eşleşen sinema yoksa boş durum gösterir", async () => {
    cinemaService.getCinemas.mockResolvedValue([]);

    renderCinemasPage();

    expect(
      await screen.findByText("Bu şehirde henüz sinemamız bulunmuyor.")
    ).toBeInTheDocument();
  });

  it("servis hata verirse kullanıcıya bildirir", async () => {
    cinemaService.getCinemas.mockRejectedValue(
      new Error("Sunucuya ulaşılamıyor.")
    );

    renderCinemasPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sunucuya ulaşılamıyor."
    );
  });

  it("'Seansları Gör' kullanıcıyı ana sayfaya yönlendirir", async () => {
    renderCinemasPage(true);

    const firstCard = (
      await screen.findAllByRole("heading", { level: 3 })
    )[0].closest(".cinema-card");

    fireEvent.click(
      within(firstCard).getByRole("button", { name: "Seansları Gör" })
    );

    expect(await screen.findByText("Ana sayfa")).toBeInTheDocument();
  });
});
