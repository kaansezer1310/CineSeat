import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import reservationService from "../../services/reservationService.js";
import movieService from "../../services/movieService.js";
import AdminReservationsPage from "./AdminReservationsPage.jsx";

vi.mock("../../services/reservationService.js", () => ({
  default: { getAllReservations: vi.fn() },
}));

vi.mock("../../services/movieService.js", () => ({
  default: { getMovies: vi.fn() },
}));

const RESERVATIONS = [
  {
    id: 1,
    resNo: "RES-001",
    showtimeId: 91,
    startDatetime: "2026-09-02T17:00:00+00:00",
    movieTitle: "The Odyssey",
    ticketCount: 2,
    total: 520,
    status: "Completed",
  },
  {
    id: 2,
    resNo: "RES-002",
    showtimeId: 92,
    startDatetime: "2026-09-03T17:00:00+00:00",
    movieTitle: "Toy Story 5",
    ticketCount: 3,
    total: 300,
    status: "Cancelled",
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminReservationsPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AdminReservationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    movieService.getMovies.mockResolvedValue([
      { id: 7, title: "The Odyssey" },
    ]);
    reservationService.getAllReservations.mockResolvedValue({
      items: RESERVATIONS,
      totalCount: 2,
    });
  });

  it("rezervasyonları listeler", async () => {
    renderPage();

    expect(await screen.findByText("RES-001")).toBeInTheDocument();

    // "The Odyssey" film filtresinde de <option> olarak var; tabloya bak.
    const table = screen.getByRole("table");
    expect(within(table).getByText("The Odyssey")).toBeInTheDocument();
    expect(within(table).getByText("Toy Story 5")).toBeInTheDocument();
  });

  it("iptalleri ciroya katmaz", async () => {
    // 520 (tamamlandı) + 300 (iptal) → yalnızca 520 sayılmalı.
    renderPage();

    await screen.findByText("RES-001");

    expect(screen.getByText("520,00")).toBeInTheDocument();
  });

  it("bilet sayısını iptaller dahil toplar", async () => {
    renderPage();

    await screen.findByText("RES-001");

    // 2 + 3 = 5 bilet
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("durum filtresini sunucuya gönderir", async () => {
    renderPage();

    await screen.findByText("RES-001");

    fireEvent.change(screen.getByLabelText("Durum"), {
      target: { value: "Completed" },
    });

    await waitFor(() => {
      expect(reservationService.getAllReservations).toHaveBeenCalledWith(
        expect.objectContaining({ status: "Completed" })
      );
    });
  });

  it("tarih filtresini gün sınırlarıyla gönderir", async () => {
    renderPage();

    await screen.findByText("RES-001");

    fireEvent.change(screen.getByLabelText("Başlangıç"), {
      target: { value: "2026-09-01" },
    });

    await waitFor(() => {
      expect(reservationService.getAllReservations).toHaveBeenCalledWith(
        expect.objectContaining({ from: "2026-09-01T00:00:00Z" })
      );
    });
  });

  it("filtreleri temizler", async () => {
    renderPage();

    await screen.findByText("RES-001");

    fireEvent.change(screen.getByLabelText("Durum"), {
      target: { value: "Cancelled" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Filtreleri Temizle" })
    );

    expect(screen.getByLabelText("Durum")).toHaveValue("");
  });
});
