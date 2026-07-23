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
    getAllReservations: vi.fn(),
  },
}));

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
    reservationService.getAllReservations.mockResolvedValue([
      {
        id: "RES-11111",
        createdAt: "2020-01-01T10:00:00.000Z",
        ticketCount: 2,
        totalPrice: 440,
        visitorInfo: null,
        items: [
          {
            sessionId: 999,
            movieTitle: "Gelecek Film",
            date: "31 Aralık",
            time: "23:59",
            hallName: "Salon 1",
            seats: [],
          },
        ],
      },
    ]);

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

  it("gösterim saati geçmiş bir rezervasyonu, satın alma zamanına bakılmaksızın 'Geçmiş Biletler' altında gösterir", async () => {
    // createdAt (satın alma zamanı) BUGÜNE çok yakın (birkaç saniye önce) —
    // eski (hatalı) kod bunu "Güncel" sayardı çünkü sadece createdAt'e
    // bakıyordu. Doğru davranış: gösterim tarihi (date/time) geçmişte
    // olduğu için "Geçmiş" olmalı.
    reservationService.getAllReservations.mockResolvedValue([
      {
        id: "RES-22222",
        createdAt: new Date().toISOString(),
        ticketCount: 1,
        totalPrice: 220,
        visitorInfo: null,
        items: [
          {
            sessionId: 101,
            movieTitle: "Geçmiş Film",
            date: "1 Ocak",
            time: "10:00",
            hallName: "Salon 1",
            seats: [],
          },
        ],
      },
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

  it("birden fazla seans içeren bir rezervasyonda en az bir seans gelecekteyse 'Güncel' sayılır", async () => {
    reservationService.getAllReservations.mockResolvedValue([
      {
        id: "RES-33333",
        createdAt: "2020-01-01T10:00:00.000Z",
        ticketCount: 2,
        totalPrice: 440,
        visitorInfo: null,
        items: [
          {
            sessionId: 1,
            movieTitle: "Geçmiş Seans",
            date: "1 Ocak",
            time: "10:00",
            hallName: "Salon 1",
            seats: [],
          },
          {
            sessionId: 2,
            movieTitle: "Gelecek Seans",
            date: "31 Aralık",
            time: "23:59",
            hallName: "Salon 2",
            seats: [],
          },
        ],
      },
    ]);

    renderProfilePage();

    fireEvent.click(
      await screen.findByRole("tab", { name: "Biletlerim" })
    );

    const currentSection = screen
      .getByText("Güncel Biletler")
      .closest("div");

    expect(
      within(currentSection).getByText("RES-33333")
    ).toBeInTheDocument();
  });

  it("hiç rezervasyon yoksa her iki sekmede de boş durum mesajı gösterir", async () => {
    reservationService.getAllReservations.mockResolvedValue([]);

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
    reservationService.getAllReservations.mockResolvedValue([]);
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
