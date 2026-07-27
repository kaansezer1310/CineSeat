import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import AuthContext from "./AuthContext.js";
import WatchlistProvider from "./WatchlistProvider.jsx";
import useWatchlist from "../hooks/useWatchlist.js";

function TestConsumer() {
  const { watchlist, toggleFavorite } = useWatchlist();

  return (
    <div>
      <span data-testid="watchlist">{JSON.stringify(watchlist)}</span>
      <button onClick={() => toggleFavorite(1)}>Toggle 1</button>
    </div>
  );
}

function renderWithUser(user) {
  return render(
    <AuthContext.Provider value={{ user, role: user?.role ?? "guest" }}>
      <WatchlistProvider>
        <TestConsumer />
      </WatchlistProvider>
    </AuthContext.Provider>
  );
}

describe("WatchlistProvider — kullanıcı değişince yeniden senkronizasyon", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("kullanıcı A'nın favorisi, kullanıcı B'ye geçince (aynı oturumda) sızmaz", () => {
    localStorage.setItem(
      "cineseat_watchlist_1",
      JSON.stringify([42])
    );
    localStorage.setItem(
      "cineseat_watchlist_2",
      JSON.stringify([])
    );

    const { rerender } = renderWithUser({ id: 1, role: "member" });

    expect(screen.getByTestId("watchlist").textContent).toBe(
      "[42]"
    );

    rerender(
      <AuthContext.Provider
        value={{ user: { id: 2, role: "member" }, role: "member" }}
      >
        <WatchlistProvider>
          <TestConsumer />
        </WatchlistProvider>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId("watchlist").textContent).toBe("[]");
  });

  it("toggleFavorite, doğru kullanıcının localStorage kaydını günceller", () => {
    renderWithUser({ id: 5, role: "member" });

    fireEvent.click(screen.getByText("Toggle 1"));

    expect(
      JSON.parse(localStorage.getItem("cineseat_watchlist_5"))
    ).toEqual([1]);
  });
});
