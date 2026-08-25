import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToastProvider from "../../context/ToastProvider.jsx";
import movieService from "../../services/movieService.js";
import AdminMoviesPage from "./AdminMoviesPage.jsx";

vi.mock("../../services/movieService.js", () => ({
  default: {
    getMovies: vi.fn(),
    getArchivedMovies: vi.fn(),
    archiveMovie: vi.fn(),
    restoreMovie: vi.fn(),
  },
}));

const MOVIE = {
  id: 1,
  title: "Yeşilçam Gecesi",
  genre: "Dram",
  duration: 118,
  ageRating: "13+",
  poster: "/posters/yesilcam.png",
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ToastProvider>
          <AdminMoviesPage />
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AdminMoviesPage — arşivleme akışı", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    movieService.getMovies.mockResolvedValue([MOVIE]);
    movieService.getArchivedMovies.mockResolvedValue([]);
    movieService.archiveMovie.mockResolvedValue(true);
    movieService.restoreMovie.mockResolvedValue(true);
  });

  it("katalogdaki filmi listeler", async () => {
    renderPage();

    expect(await screen.findByText("Yeşilçam Gecesi")).toBeInTheDocument();
  });

  // T7: eylem "Sil" değil "Arşivle" — kayıt kalıcı silinmiyor.
  it("silme değil arşivleme eylemi sunar", async () => {
    renderPage();

    await screen.findByText("Yeşilçam Gecesi");

    expect(
      screen.getByRole("button", { name: "Arşivle" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sil" })
    ).not.toBeInTheDocument();
  });

  it("arşivlemeden önce onay diyaloğu açar ve hemen istek atmaz", async () => {
    renderPage();

    await screen.findByText("Yeşilçam Gecesi");

    fireEvent.click(screen.getByRole("button", { name: "Arşivle" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Yeşilçam Gecesi");
    expect(dialog).toHaveTextContent("Kayıt silinmez");
    expect(movieService.archiveMovie).not.toHaveBeenCalled();
  });

  it("vazgeçilirse arşivleme yapılmaz", async () => {
    renderPage();

    await screen.findByText("Yeşilçam Gecesi");
    fireEvent.click(screen.getByRole("button", { name: "Arşivle" }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Vazgeç" }));

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
    expect(movieService.archiveMovie).not.toHaveBeenCalled();
  });

  it("onaylanınca arşivler ve başarı bildirimi gösterir", async () => {
    renderPage();

    await screen.findByText("Yeşilçam Gecesi");
    fireEvent.click(screen.getByRole("button", { name: "Arşivle" }));

    await screen.findByRole("dialog");
    // Diyalogdaki onay butonu (tablodakiyle aynı adı taşıyor)
    const dialogConfirm = screen
      .getByRole("dialog")
      .querySelector(".admin-btn-delete");
    fireEvent.click(dialogConfirm);

    await waitFor(() => {
      expect(movieService.archiveMovie).toHaveBeenCalledWith(1);
    });

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("arşivlendi");
  });

  it("arşivleme hata verirse hata bildirimi gösterir", async () => {
    movieService.archiveMovie.mockRejectedValue(
      new Error("Sunucuya ulaşılamıyor.")
    );

    renderPage();

    await screen.findByText("Yeşilçam Gecesi");
    fireEvent.click(screen.getByRole("button", { name: "Arşivle" }));

    await screen.findByRole("dialog");
    fireEvent.click(
      screen.getByRole("dialog").querySelector(".admin-btn-delete")
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sunucuya ulaşılamıyor."
    );
  });

  it("arşiv sekmesinde geri alma sunar", async () => {
    movieService.getArchivedMovies.mockResolvedValue([MOVIE]);

    renderPage();

    await screen.findByText("Yeşilçam Gecesi");
    fireEvent.click(screen.getByRole("button", { name: "Arşivi Göster" }));

    const restore = await screen.findByRole("button", { name: "Geri Al" });
    fireEvent.click(restore);

    await waitFor(() => {
      expect(movieService.restoreMovie).toHaveBeenCalledWith(1);
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      "geri alındı"
    );
  });
});
