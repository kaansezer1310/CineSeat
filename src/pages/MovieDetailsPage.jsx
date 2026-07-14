import { useQuery } from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import SessionList from "../components/sessions/SessionList.jsx";
import movieService from "../services/movieService.js";
import sessionService from "../services/sessionService.js";

function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const numericMovieId = Number(movieId);

  const {
    data: movie,
    isLoading: isMovieLoading,
    error: movieError,
  } = useQuery({
    queryKey: ["movie", numericMovieId],
    queryFn: () => {
      return movieService.getMovieById(numericMovieId);
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: sessions = [],
    isLoading: areSessionsLoading,
    error: sessionsError,
  } = useQuery({
    queryKey: ["sessions", numericMovieId],
    queryFn: () => {
      return sessionService.getSessionsByMovieId(
        numericMovieId
      );
    },
    staleTime: 60 * 1000,
  });

  function handleSessionSelect(sessionId) {
    navigate(`/booking/${sessionId}`);
  }

  if (isMovieLoading || areSessionsLoading) {
    return (
      <div className="temporary-panel">
        Film ve seans bilgileri yükleniyor.
      </div>
    );
  }

  if (movieError || sessionsError) {
    const errorMessage =
      movieError?.message ||
      sessionsError?.message ||
      "Bilgiler alınamadı.";

    return (
      <section>
        <div className="page-heading">
          <h1>Film bilgileri alınamadı</h1>
          <p>{errorMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="movie-details-layout">
        <div className="movie-details-poster-wrapper">
          <img
            className="movie-details-poster"
            src={movie.poster}
            alt={`${movie.title} film posteri`}
          />
        </div>

        <div className="movie-details-content">
          <p className="page-label">{movie.genre}</p>

          <h1>{movie.title}</h1>

          <div className="movie-details-meta">
            <span>{movie.releaseYear}</span>
            <span>{movie.duration} dakika</span>
            <span>{movie.ageRating}</span>
          </div>

          <p className="movie-details-description">
            {movie.description}
          </p>

          <div className="movie-details-note">
            <strong>Film hakkında</strong>

            <p>
              Seans seçiminin ardından salonun koltuk
              planına yönlendirileceksin.
            </p>
          </div>
        </div>
      </div>

      <SessionList
        sessions={sessions}
        onSessionSelect={handleSessionSelect}
      />
    </section>
  );
}

export default MovieDetailsPage;