import { createContext, useState, useContext, useCallback } from "react";
import useAuth from "../hooks/useAuth.js";

/**
 * Sprint 3 / 1.2.7 — İzleme listesi state (REQ-24)
 *
 * Kullanıcı başına localStorage'da tutulan favori film listesi.
 * Yalnız giriş yapan üyeler (member/admin) favori ekleyebilir.
 */

const WatchlistContext = createContext(null);

function getStorageKey(userId) {
  return `cineseat_watchlist_${userId}`;
}

function loadWatchlist(userId) {
  if (!userId) return [];
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWatchlist(userId, list) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
}

function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [watchlist, setWatchlist] = useState(() => loadWatchlist(userId));

  // Kullanıcı değiştiğinde watchlist'i yeniden yükle
  const prevUserIdRef = { current: userId };
  if (prevUserIdRef.current !== userId) {
    prevUserIdRef.current = userId;
    // Re-sync (bu sadece kullanıcı değişince — login/logout)
  }

  const toggleFavorite = useCallback(
    (movieId) => {
      if (!userId) return;
      setWatchlist((prev) => {
        const current = loadWatchlist(userId);
        let updated;
        if (current.includes(movieId)) {
          updated = current.filter((id) => id !== movieId);
        } else {
          updated = [...current, movieId];
        }
        saveWatchlist(userId, updated);
        return updated;
      });
    },
    [userId]
  );

  const isFavorite = useCallback(
    (movieId) => {
      if (!userId) return false;
      return loadWatchlist(userId).includes(movieId);
    },
    [userId]
  );

  const getFavoriteMovieIds = useCallback(() => {
    if (!userId) return [];
    return loadWatchlist(userId);
  }, [userId]);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, toggleFavorite, isFavorite, getFavoriteMovieIds }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}

export { WatchlistProvider, useWatchlist };
export default WatchlistContext;
