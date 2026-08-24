import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useAuth from "../hooks/useAuth.js";
import favoriteService from "../services/favoriteService.js";
import WatchlistContext from "./WatchlistContext.js";

/**
 * İzleme listesi (REQ-24).
 *
 * Liste kullanıcı hesabına bağlı olarak backend'de tutulur; tarayıcı verisi
 * silindiğinde ya da başka bir cihazdan girildiğinde kaybolmaz. Yalnızca
 * giriş yapmış kullanıcı favori ekleyebilir.
 */
function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id;

  const { data: favorites = [] } = useQuery({
    // Kullanıcı anahtara dahil: çıkış/giriş yapıldığında önceki kullanıcının
    // listesi ekranda kalmaz.
    queryKey: ["favorites", userId],
    queryFn: favoriteService.getMyFavorites,
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });

  const watchlist = favorites.map((favorite) => favorite.movieId);

  const toggleMutation = useMutation({
    mutationFn: ({ movieId, isCurrentlyFavorite }) =>
      isCurrentlyFavorite
        ? favoriteService.removeFavorite(movieId)
        : favoriteService.addFavorite(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });

  const isFavorite = useCallback(
    (movieId) => watchlist.includes(movieId),
    [watchlist]
  );

  const toggleFavorite = useCallback(
    (movieId) => {
      if (!userId) {
        return;
      }

      toggleMutation.mutate({
        movieId,
        isCurrentlyFavorite: watchlist.includes(movieId),
      });
    },
    [userId, watchlist, toggleMutation]
  );

  const getFavoriteMovieIds = useCallback(() => watchlist, [watchlist]);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, favorites, toggleFavorite, isFavorite, getFavoriteMovieIds }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export default WatchlistProvider;
