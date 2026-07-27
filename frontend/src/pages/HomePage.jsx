import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import MovieList from "../components/movies/MovieList.jsx";
import SortControl, {
  DEFAULT_SORT,
} from "../components/movies/SortControl.jsx";
import FilterControl, {
  ALL_VALUE,
} from "../components/movies/FilterControl.jsx";
import movieService from "../services/movieService.js";
import CinemasPage from "./CinemasPage.jsx";
import useWatchlist from "../hooks/useWatchlist.js";

// REQ-25 — favori bir film vizyona girdiğinde girişte bildirim bandı.
// "Yakın zamanda vizyona girdi" penceresi 7 gün olarak seçildi: gösterge
// süresiz kalırsa (ör. 3 ay önce vizyona giren eski bir favori) her girişte
// gösterilmesi rahatsız edici olurdu; 7 gün, "yeni vizyona girdi" haberini
// vermek için makul ve pratik bir eşik.
const RECENTLY_RELEASED_WINDOW_DAYS = 7;

function isRecentlyReleased(movie) {
  // getDaysUntilRelease, releaseDate'i olmayan filmlerde parse hatası verir
  // (bkz. movieService.js) — bu yüzden burada önce varlığı kontrol edilir.
  if (!movie.releaseDate) {
    return false;
  }

  const daysUntilRelease = movieService.getDaysUntilRelease(movie);
  return (
    daysUntilRelease <= 0 &&
    daysUntilRelease > -RECENTLY_RELEASED_WINDOW_DAYS
  );
}

const MOVIE_TABS = [
  { id: "nowShowing", label: "Vizyonda" },
  { id: "comingSoon", label: "Yakında" },
  { id: "cinemas", label: "Sinemalar" },
];

function HomePage() {
  const navigate = useNavigate();
  const { getFavoriteMovieIds } = useWatchlist();

  const [activeTab, setActiveTab] = useState("nowShowing");
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);
  const [genreFilter, setGenreFilter] = useState(ALL_VALUE);
  const [ageRatingFilter, setAgeRatingFilter] = useState(ALL_VALUE);
  const [isReleaseBannerDismissed, setIsReleaseBannerDismissed] =
    useState(false);

  const {
    data: movies = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  function handleMovieSelect(movieId) {
    navigate(`/movies/${movieId}`);
  }

  if (isLoading) {
    return (
      <section>
        <div className="page-heading">
          <h1>Filmler yükleniyor...</h1>
        </div>

        <div className="temporary-panel">
          Film verileri getiriliyor.
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="page-heading">
          <h1>Filmler alınamadı</h1>
          <p>{error.message}</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => refetch()}
        >
          Tekrar Dene
        </button>
      </section>
    );
  }

  // REQ-05: vizyon süresi dolan filmler arşive düşer, ana sayfada hiçbir
  // sekmede gösterilmez (veri movies.js'ten silinmez, sadece burada elenir).
  const activeMovies = movies.filter((movie) => {
    return !movieService.isMovieArchived(movie);
  });

  const nowShowingMovies = activeMovies.filter((movie) => {
    return movieService.isMovieReleased(movie);
  });

  // REQ-15: "Yakında" sekmesi bugünden itibaren en fazla 6 ay ileride
  // vizyona girecek filmlerle sınırlıdır (daha uzak filmler veride kalır,
  // sadece burada gösterilmez).
  const comingSoonMovies = activeMovies.filter((movie) => {
    return (
      !movieService.isMovieReleased(movie) &&
      movieService.isWithinComingSoonWindow(movie)
    );
  });

  const tabMovies =
    activeTab === "nowShowing"
      ? nowShowingMovies
      : comingSoonMovies;

  // REQ-25 — izleme listesindeki filmlerden yakın zamanda vizyona girenler.
  const favoriteMovieIds = getFavoriteMovieIds();
  const recentlyReleasedFavorites = activeMovies.filter(
    (movie) =>
      favoriteMovieIds.includes(movie.id) && isRecentlyReleased(movie)
  );

  // REQ-08.1: sıralama ve filtre, aktif sekmenin filmleri üzerinde birlikte
  // uygulanır. Seçenekler filtre uygulanmadan ÖNCEKİ kümeden türetilir,
  // böylece bir filtre sonucu boş kalsa bile diğer seçenekler kaybolmaz.
  const availableGenres = movieService.getAvailableGenres(tabMovies);
  const availableAgeRatings =
    movieService.getAvailableAgeRatings(tabMovies);

  const filteredMovies = movieService.filterMovies(tabMovies, {
    genre: genreFilter,
    ageRating: ageRatingFilter,
  });

  const visibleMovies = movieService.sortMovies(
    filteredMovies,
    sortValue
  );

  const isFilterActive =
    genreFilter !== ALL_VALUE || ageRatingFilter !== ALL_VALUE;

  const pageHeading =
    activeTab === "nowShowing"
      ? "Vizyondaki Filmler"
      : activeTab === "comingSoon"
      ? "Yakında Vizyona Girecek Filmler"
      : "Sinemalarımız";

  const pageDescription =
    activeTab === "nowShowing"
      ? "Film seçerek seansları inceleyebilir ve bilet oluşturabilirsin."
      : activeTab === "comingSoon"
      ? "Yakında vizyona girecek filmleri keşfet, vizyon tarihini kaçırma."
      : "Size en yakın sinemaları keşfedin ve detayları görün.";

  const emptyStateMessage =
    tabMovies.length === 0
      ? activeTab === "nowShowing"
        ? "Şu anda vizyonda film bulunmuyor."
        : "Yakında vizyona girecek film bulunmuyor."
      : "Seçtiğin filtrelere uyan film bulunamadı.";

  return (
    <section>
      {recentlyReleasedFavorites.length > 0 &&
        !isReleaseBannerDismissed && (
          <div className="release-notification-banner" role="status">
            <span>
              🎬 İzleme listenizden{" "}
              <strong>
                {recentlyReleasedFavorites
                  .map((movie) => movie.title)
                  .join(", ")}
              </strong>{" "}
              vizyona girdi!
            </span>

            <button
              type="button"
              className="release-notification-dismiss"
              onClick={() => setIsReleaseBannerDismissed(true)}
              aria-label="Bildirimi kapat"
            >
              ✕
            </button>
          </div>
        )}

      <div className="page-heading-row">
        <div className="page-heading">
          <h1>{pageHeading}</h1>

          <p>{pageDescription}</p>
        </div>

        {activeTab !== "cinemas" && (
          <button
            className="refresh-button"
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Yenileniyor..." : "↻ Filmleri Yenile"}
          </button>
        )}
      </div>

      <div
        className="movie-tab-list"
        role="tablist"
      >
        {MOVIE_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                isActive
                  ? "movie-tab-button movie-tab-button-active"
                  : "movie-tab-button"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "cinemas" ? (
        <CinemasPage
          onViewSessions={() => setActiveTab("nowShowing")}
        />
      ) : (
        <>
          {tabMovies.length > 0 && (
            <div className="movie-controls-row">
              <SortControl
                value={sortValue}
                onChange={setSortValue}
              />

              <FilterControl
                genres={availableGenres}
                ageRatings={availableAgeRatings}
                selectedGenre={genreFilter}
                selectedAgeRating={ageRatingFilter}
                onGenreChange={setGenreFilter}
                onAgeRatingChange={setAgeRatingFilter}
              />

              {isFilterActive && (
                <button
                  type="button"
                  className="secondary-button movie-filter-clear-button"
                  onClick={() => {
                    setGenreFilter(ALL_VALUE);
                    setAgeRatingFilter(ALL_VALUE);
                  }}
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          )}

          {visibleMovies.length === 0 ? (
        <div className="temporary-panel">
          {emptyStateMessage}
        </div>
      ) : (
        <MovieList
          movies={visibleMovies}
          onMovieSelect={handleMovieSelect}
        />
      )}
        </>
      )}
    </section>
  );
}

export default HomePage;
