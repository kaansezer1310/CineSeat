import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import MovieList from "../components/movies/MovieList.jsx";
import movieService from "../services/movieService.js";

function HomePage() {
  const navigate = useNavigate();

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

  return (
    <section>
      <div className="page-heading-row">
        <div className="page-heading">
          <h1>Vizyondaki Filmler</h1>

          <p>
            Film seçerek seansları inceleyebilir ve bilet
            oluşturabilirsin.
          </p>
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

      <MovieList
        movies={movies}
        onMovieSelect={handleMovieSelect}
      />
    </section>
  );
}

export default HomePage;
