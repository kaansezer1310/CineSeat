import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import MovieList from "../components/movies/MovieList.jsx";
import movieService from "../services/movieService.js";
import CinemasPage from "./CinemasPage.jsx";

const MOVIE_TABS = [
  { id: "nowShowing", label: "Vizyonda" },
  { id: "comingSoon", label: "Yakında" },
  { id: "cinemas", label: "Sinemalar" },
];

function HomePage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("nowShowing");

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

  const comingSoonMovies = activeMovies.filter((movie) => {
    return !movieService.isMovieReleased(movie);
  });

  const visibleMovies =
    activeTab === "nowShowing"
      ? nowShowingMovies
      : comingSoonMovies;

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
    activeTab === "nowShowing"
      ? "Şu anda vizyonda film bulunmuyor."
      : "Yakında vizyona girecek film bulunmuyor.";

  return (
    <section>
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
        <CinemasPage />
      ) : visibleMovies.length === 0 ? (
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
