import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartProvider from "../context/CartProvider.jsx";
import AuthProvider from "../context/AuthProvider.jsx";
import reservationService from "../services/reservationService.js";
import movieService from "../services/movieService.js";
import useWatchlist from "../hooks/useWatchlist.js";
import ProfilePage from "./ProfilePage.jsx";

vi.mock("../services/reservationService.js", () => ({
  default: {
    getMyReservations: vi.fn(),
  },
}));

// Backend özeti: rezervasyon başına TEK seans; seans başlangıcı ISO tarih.
function reservationSummary(overrides = {}) {
  return {
    id: 1,
    resNo: "RES-11111",
    showtimeId: 999,
    startDatetime: "2099-12-31T23:59:00+03:00",
    movieTitle: "Gelecek Film",
    ticketCount: 2,
    total: 440,
    status: "Completed",
    ...overrides,
  };
}

function mockReservations(items) {
  reservationService.getMyReservations.mockResolvedValue({
    items,
    totalCount: items.length,
  });
}

vi.mock("../services/movieService.js", async () => {
  const actual = await vi.importActual(
    "../services/movieService.js"
  );

  return {
    default: {
      ...actual.default,
      getMovies: vi.fn(),
    },
  };
});

vi.mock("../hooks/useWatchlist.js", () => ({
  default: vi.fn(),
}));

function loginAsMember() {
  sessionStorage.setItem(
    "cineseat_user",
    JSON.stringify({
      id: 4,
      firstName: "Berke",
      lastName: "Kuş",
      name: "Berke",
      username: "berke",
      email: "berke@cineseat.com",
      role: "member",
    })
  );
}

function renderProfilePage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CartProvider>
          <AuthProvider>
            <ProfilePage />
          </AuthProvider>
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("ProfilePage — Bilet sekmeleri (1.2.6, REQ-18)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    loginAsMember();
    movieService.getMovies.mockResolvedValue([]);
    useWatchlist.mockReturnValue({
      getFavoriteMovieIds: vi.fn(() => []),
      toggleFavorite: vi.fn(),
    });
  });

  it("gösterim saati henüz geçmemiş bir rezervasyonu 'Güncel Biletler' altında gösterir", async () => {
    mockReservations([reservationSummary()]);

    renderProfilePage();

    fireEvent.click(
      await screen.findByRole("tab", { name: "Biletlerim" })
    );

    const currentSection = screen
      .getByText("Güncel Biletler")
      .closest("div");

    expect(
      within(currentSection).getByText("RES-11111")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Geçmiş biletiniz bulunmuyor.")
    ).toBeInTheDocument();
  });

  it("gösterim saati geçmiş bir rezervasyonu 'Geçmiş Biletler' altında gösterir", async () => {
    // REQ-18: ayrım GÖSTERİM saatine göre yapılır, satın alma zamanına değil.
    mockReservations([
      reservationSummary({
        id: 2,
        resNo: "RES-22222",
        startDatetime: "2020-01-01T10:00:00+03:00",
        movieTitle: "Geçmiş Film",
        ticketCount: 1,
        total: 220,
      }),
    ]);

    renderProfilePage();

    fireEvent.click(
      await screen.findByRole("tab", { name: "Biletlerim" })
    );

    const pastSection = screen
      .getByText("Geçmiş Biletler")
      .closest("div");

    expect(
      within(pastSection).getByText("RES-22222")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Güncel biletiniz bulunmuyor.")
    ).toBeInTheDocument();
  });

  it("güncel ve geçmiş rezervasyonları ayrı bölümlere yerleştirir", async () => {
    mockReservations([
      reservationSummary({ id: 1, resNo: "RES-GELECEK" }),
      reservationSummary({
        id: 2,
        resNo: "RES-GECMIS",
        startDatetime: "2020-01-01T10:00:00+03:00",
      }),
    ]);

    renderProfilePage();

    fireEvent.click(
      await screen.findByRole("tab", { name: "Biletlerim" })
    );

    const currentSection = screen
      .getByText("Güncel Biletler")
      .closest("div");
    const pastSection = screen
      .getByText("Geçmiş Biletler")
      .closest("div");

    expect(
      within(currentSection).getByText("RES-GELECEK")
    ).toBeInTheDocument();
    expect(
      within(pastSection).getByText("RES-GECMIS")
    ).toBeInTheDocument();
  });

  it("bilet kartında film adını ve tutarı gösterir", async () => {
    mockReservations([reservationSummary()]);

    renderProfilePage();

    fireEvent.click(
      await screen.findByRole("tab", { name: "Biletlerim" })
    );

    expect(
      await screen.findByText("Gelecek Film")
    ).toBeInTheDocument();
    expect(screen.getByText("2 bilet")).toBeInTheDocument();
    expect(screen.getByText("440.00 ₺")).toBeInTheDocument();
  });

  it("hiç rezervasyon yoksa her iki sekmede de boş durum mesajı gösterir", async () => {
    mockReservations([]);

    renderProfilePage();

    fireEvent.click(
      await screen.findByRole("tab", { name: "Biletlerim" })
    );

    expect(
      await screen.findByText("Güncel biletiniz bulunmuyor.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Geçmiş biletiniz bulunmuyor.")
    ).toBeInTheDocument();
  });
});

describe("ProfilePage — İzleme Listem sekmesi (1.2.8, REQ-25)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    loginAsMember();
    mockReservations([]);
  });

  it("izleme listesi boşsa boş durum mesajı gösterir", async () => {
    useWatchlist.mockReturnValue({
      getFavoriteMovieIds: vi.fn(() => []),
      toggleFavorite: vi.fn(),
    });
    movieService.getMovies.mockResolvedValue([]);

    renderProfilePage();

    fireEvent.click(
      await screen.findByRole("tab", { name: "İzleme Listem" })
    );

    expect(
      await screen.findByText(/İzleme listeniz boş/)
    ).toBeInTheDocument();
  });

  it("favori filmleri listeler ve sekme rozetinde sayıyı gösterir", async () => {
    useWatchlist.mockReturnValue({
      getFavoriteMovieIds: vi.fn(() => [1]),
      toggleFavorite: vi.fn(),
    });
    movieService.getMovies.mockResolvedValue([
      {
        id: 1,
        title: "Neon Yağmuru",
        releaseDate: "2020-01-01",
        genre: "Dram",
      },
    ]);

    renderProfilePage();

    expect(
      await screen.findByText("1")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("tab", { name: /İzleme Listem/ })
    );

    expect(
      await screen.findByText("Neon Yağmuru")
    ).toBeInTheDocument();
  });
});
