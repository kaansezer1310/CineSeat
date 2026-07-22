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

const MOVIE_TABS = [
  { id: "nowShowing", label: "Vizyonda" },
  { id: "comingSoon", label: "Yakında" },
];

function HomePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("nowShowing");
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);
  const [genreFilter, setGenreFilter] = useState(ALL_VALUE);
  const [ageRatingFilter, setAgeRatingFilter] = useState(ALL_VALUE);

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
      : "Yakında Vizyona Girecek Filmler";

  const pageDescription =
    activeTab === "nowShowing"
      ? "Film seçerek seansları inceleyebilir ve bilet oluşturabilirsin."
      : "Yakında vizyona girecek filmleri keşfet, vizyon tarihini kaçırma.";

  const emptyStateMessage =
    tabMovies.length === 0
      ? activeTab === "nowShowing"
        ? "Şu anda vizyonda film bulunmuyor."
        : "Yakında vizyona girecek film bulunmuyor."
      : "Seçtiğin filtrelere uyan film bulunamadı.";

  return (
    <section>
      <div className="page-heading-row">
        <div className="page-heading">
          <h1>{pageHeading}</h1>

          <p>{pageDescription}</p>
        </div>

        <button
          className="refresh-button"
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Yenileniyor..." : "↻ Filmleri Yenile"}
        </button>
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
    </section>
  );
}

export default HomePage;
