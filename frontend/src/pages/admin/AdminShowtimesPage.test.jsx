import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToastProvider from "../../context/ToastProvider.jsx";
import movieService from "../../services/movieService.js";
import { cinemaResource } from "../../services/locationService.js";
import { hallResource } from "../../services/venueService.js";
import showtimeService from "../../services/showtimeService.js";
import AdminShowtimesPage from "./AdminShowtimesPage.jsx";

vi.mock("../../services/movieService.js", () => ({
  default: { getMovies: vi.fn() },
}));

vi.mock("../../services/locationService.js", () => ({
  cinemaResource: { list: vi.fn() },
}));

vi.mock("../../services/venueService.js", () => ({
  hallResource: { list: vi.fn() },
}));

vi.mock("../../services/showtimeService.js", async () => {
  const actual = await vi.importActual("../../services/showtimeService.js");

  return {
    ...actual,
    default: {
      listByCinema: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  };
});

const CINEMAS = [{ id: 1, name: "CineSeat Kadıköy" }];
const HALLS = [{ id: 2, name: "Salon 1", cinemaId: 1 }];
const MOVIES = [{ id: 7, title: "The Odyssey", duration: 172 }];

const SHOWTIMES = [
  {
    id: 91,
    movieId: 7,
    hallId: 2,
    startDatetime: "2026-09-02T17:00:00+00:00",
    basePrice: 260,
    format: "IMAX",
    hallName: "Salon 1",
    cinemaName: "CineSeat Kadıköy",
    totalSeats: 78,
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <AdminShowtimesPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

async function selectCinema() {
  // Seçenekler sinema sorgusu dönene kadar DOM'da yok; önce onları bekle,
  // yoksa change olayı sessizce hiçbir şey yapmaz.
  await screen.findByRole("option", { name: "CineSeat Kadıköy" });

  fireEvent.change(screen.getByLabelText("Sinema"), {
    target: { value: "1" },
  });
}

describe("AdminShowtimesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cinemaResource.list.mockResolvedValue(CINEMAS);
    hallResource.list.mockResolvedValue(HALLS);
    movieService.getMovies.mockResolvedValue(MOVIES);
    showtimeService.listByCinema.mockResolvedValue(SHOWTIMES);
    showtimeService.create.mockResolvedValue(1);
    showtimeService.remove.mockResolvedValue(null);
  });

  it("sinema seçilmeden seans sorgusu atmaz", async () => {
    renderPage();

    await screen.findByLabelText("Sinema");

    expect(showtimeService.listByCinema).not.toHaveBeenCalled();
    expect(screen.getByText("Önce bir sinema seçin")).toBeInTheDocument();
  });

  it("sinema seçilince seansları film adıyla listeler", async () => {
    renderPage();
    await selectCinema();

    await waitFor(() => {
      expect(showtimeService.listByCinema).toHaveBeenCalledWith("1");
    });

    expect(await screen.findByText("The Odyssey")).toBeInTheDocument();
    expect(screen.getByText("Salon 1")).toBeInTheDocument();
    expect(screen.getByText("IMAX")).toBeInTheDocument();
  });

  it("form filmin süresini gösterir", async () => {
    // Yönetici çakışma penceresini süreye göre tahmin edebilmeli.
    renderPage();
    await selectCinema();
    await screen.findByText("The Odyssey");

    fireEvent.click(screen.getByRole("button", { name: "+ Seans Ekle" }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/Film/), {
      target: { value: "7" },
    });

    expect(dialog).toHaveTextContent("The Odyssey · 172 dk");
  });

  it("çakışma hatasını form içinde gösterir ve diyaloğu kapatmaz", async () => {
    showtimeService.create.mockRejectedValue(
      new Error("Bu salonda 02.09.2026 20:00 seansiyla cakisiyor.")
    );

    renderPage();
    await selectCinema();
    await screen.findByText("The Odyssey");

    fireEvent.click(screen.getByRole("button", { name: "+ Seans Ekle" }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText(/Film/), {
      target: { value: "7" },
    });
    fireEvent.change(within(dialog).getByLabelText(/Salon/), {
      target: { value: "2" },
    });
    fireEvent.change(within(dialog).getByLabelText(/Başlangıç/), {
      target: { value: "2026-09-02T20:00" },
    });
    fireEvent.change(within(dialog).getByLabelText(/Bilet fiyatı/), {
      target: { value: "260" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kaydet" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "cakisiyor"
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("kaldırmadan önce onay ister", async () => {
    renderPage();
    await selectCinema();
    await screen.findByText("The Odyssey");

    fireEvent.click(screen.getByRole("button", { name: "Kaldır" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Salon 1");
    expect(showtimeService.remove).not.toHaveBeenCalled();

    fireEvent.click(dialog.querySelector(".admin-btn-delete"));

    await waitFor(() => {
      expect(showtimeService.remove).toHaveBeenCalledWith(91);
    });
  });

  it("düzenlemede formu mevcut seansla doldurur", async () => {
    renderPage();
    await selectCinema();
    await screen.findByText("The Odyssey");

    fireEvent.click(screen.getByRole("button", { name: "Düzenle" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText(/Bilet fiyatı/)).toHaveValue(260);
    expect(within(dialog).getByLabelText(/Format/)).toHaveValue("IMAX");
  });
});
