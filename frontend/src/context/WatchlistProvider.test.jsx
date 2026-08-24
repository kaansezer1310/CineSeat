import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartProvider from "./CartProvider.jsx";
import AuthProvider from "./AuthProvider.jsx";
import WatchlistProvider from "./WatchlistProvider.jsx";
import useWatchlist from "../hooks/useWatchlist.js";
import favoriteService from "../services/favoriteService.js";

vi.mock("../services/favoriteService.js", () => ({
  default: {
    getMyFavorites: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  },
}));

function WatchlistProbe() {
  const { watchlist, isFavorite, toggleFavorite } = useWatchlist();

  return (
    <div>
      <p data-testid="ids">{watchlist.join(",")}</p>
      <p data-testid="is-fav-1">{String(isFavorite(1))}</p>
      <button type="button" onClick={() => toggleFavorite(1)}>
        Değiştir
      </button>
    </div>
  );
}

function renderProbe() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AuthProvider>
          <WatchlistProvider>
            <WatchlistProbe />
          </WatchlistProvider>
        </AuthProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

function signIn(id) {
  sessionStorage.setItem(
    "cineseat_user",
    JSON.stringify({
      id,
      name: "Test",
      email: "test@cineseat.com",
      role: "member",
    })
  );
}

describe("WatchlistProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    favoriteService.getMyFavorites.mockResolvedValue([]);
  });

  it("misafir için sunucuya istek atmaz", () => {
    renderProbe();

    expect(favoriteService.getMyFavorites).not.toHaveBeenCalled();
    expect(screen.getByTestId("ids")).toHaveTextContent("");
  });

  it("giriş yapmış kullanıcının favorilerini sunucudan okur", async () => {
    signIn(4);
    favoriteService.getMyFavorites.mockResolvedValue([
      { movieId: 1, title: "Çığlık" },
      { movieId: 3, title: "Ada" },
    ]);

    renderProbe();

    await waitFor(() => {
      expect(screen.getByTestId("ids")).toHaveTextContent("1,3");
    });

    expect(screen.getByTestId("is-fav-1")).toHaveTextContent("true");
  });

  it("favoride olmayan filmi ekler", async () => {
    signIn(4);
    favoriteService.addFavorite.mockResolvedValue(null);

    renderProbe();

    await waitFor(() => {
      expect(favoriteService.getMyFavorites).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Değiştir" }));

    await waitFor(() => {
      expect(favoriteService.addFavorite).toHaveBeenCalledWith(1);
    });
    expect(favoriteService.removeFavorite).not.toHaveBeenCalled();
  });

  it("favorideki filmi çıkarır", async () => {
    signIn(4);
    favoriteService.getMyFavorites.mockResolvedValue([{ movieId: 1 }]);
    favoriteService.removeFavorite.mockResolvedValue(null);

    renderProbe();

    await waitFor(() => {
      expect(screen.getByTestId("is-fav-1")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByRole("button", { name: "Değiştir" }));

    await waitFor(() => {
      expect(favoriteService.removeFavorite).toHaveBeenCalledWith(1);
    });
  });

  it("misafirken favori değiştirmeye çalışmak istek üretmez", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Değiştir" }));

    expect(favoriteService.addFavorite).not.toHaveBeenCalled();
    expect(favoriteService.removeFavorite).not.toHaveBeenCalled();
  });
});
