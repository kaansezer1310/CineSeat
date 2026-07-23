import { useState, useCallback } from "react";
import useAuth from "../hooks/useAuth.js";
import WatchlistContext from "./WatchlistContext.js";

/**
 * Sprint 3 / 1.2.7 — İzleme listesi state (REQ-24)
 *
 * Kullanıcı başına localStorage'da tutulan favori film listesi.
 * Yalnız giriş yapan üyeler (member/admin) favori ekleyebilir.
 */

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

  // Kullanıcı değiştiğinde (login/logout) watchlist'i yeni kullanıcının
  // localStorage kaydından yeniden yükle. React'in "render sırasında state
  // ayarlama" deseni kullanılıyor (bkz. react.dev/learn/you-might-not-need-an-effect)
  // — bir `useEffect` içinde senkron `setState` yerine, önceki `userId`'yi
  // ayrı bir state'te tutup render sırasında karşılaştırarak güncelliyoruz.
  // Bu, ekstra bir render turu (effect sonrası) olmadan aynı anda commit
  // edilir ve `react-hooks/set-state-in-effect` kuralını ihlal etmez.
  const [syncedUserId, setSyncedUserId] = useState(userId);

  if (syncedUserId !== userId) {
    setSyncedUserId(userId);
    setWatchlist(loadWatchlist(userId));
  }

  const toggleFavorite = useCallback(
    (movieId) => {
      if (!userId) return;

      const current = loadWatchlist(userId);
      const updated = current.includes(movieId)
        ? current.filter((id) => id !== movieId)
        : [...current, movieId];

      saveWatchlist(userId, updated);
      setWatchlist(updated);
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

export default WatchlistProvider;
