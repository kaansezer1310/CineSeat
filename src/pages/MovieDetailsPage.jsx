import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MoviePoster from "../components/movies/MoviePoster.jsx";
import TrailerModal from "../components/movies/TrailerModal.jsx";
import RatingStars from "../components/movies/RatingStars.jsx";
import CommentForm from "../components/movies/CommentForm.jsx";
import CommentList from "../components/movies/CommentList.jsx";
import SessionList from "../components/sessions/SessionList.jsx";
import movieService from "../services/movieService.js";
import sessionService from "../services/sessionService.js";
import { useWatchlist } from "../context/WatchlistContext.jsx";

function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useWatchlist();

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

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
          <MoviePoster
            key={movie.poster}
            movie={movie}
            className="movie-details-poster"
          />
        </div>

        <div className="movie-details-content">
          <p className="page-label">{movie.genre}</p>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1>{movie.title}</h1>
            <button
              type="button"
              className={`watchlist-heart-button ${isFavorite(movie.id) ? 'watchlist-heart-button--active' : 'watchlist-heart-button--inactive'}`}
              style={{ fontSize: "2.5rem" }}
              onClick={() => toggleFavorite(movie.id)}
              title={isFavorite(movie.id) ? "İzleme listesinden çıkar" : "İzleme listesine ekle"}
              aria-label="Favori Ekle/Çıkar"
            >
              {isFavorite(movie.id) ? "♥" : "♡"}
            </button>
          </div>

          <div className="movie-details-meta">
            <span>{movie.releaseYear}</span>
            <span>{movie.duration} dakika</span>
            <span>{movie.ageRating}</span>
          </div>

          <p className="movie-details-description">
            {movie.description}
          </p>

          <button
            className="secondary-button trailer-open-button"
            type="button"
            onClick={() => setIsTrailerOpen(true)}
            disabled={!movie.fragmanYoutubeId}
            title={
              movie.fragmanYoutubeId
                ? undefined
                : "Bu film için henüz fragman eklenmedi."
            }
          >
            ▶ Fragman İzle
          </button>

          <div className="movie-details-note">
            <strong>Film hakkında</strong>

            <p>
              Seans seçiminin ardından salonun koltuk
              planına yönlendirileceksin.
            </p>
          </div>
        </div>
      </div>

      {isTrailerOpen && movie.fragmanYoutubeId && (
        <TrailerModal
          youtubeId={movie.fragmanYoutubeId}
          movieTitle={movie.title}
          onClose={() => setIsTrailerOpen(false)}
        />
      )}

      <SessionList
        sessions={sessions}
        onSessionSelect={handleSessionSelect}
      />

      {/* REQ-11: puanlama sadece vizyondaki (yayınlanmış) filmlerde
          anlamlıdır — henüz vizyona girmemiş bir filme puan verilemez. */}
      {movieService.isMovieReleased(movie) && (
        <section className="movie-details-social">
          <h2>Puanla</h2>
          <RatingStars movieId={movie.id} />
        </section>
      )}

      <section className="movie-details-social">
        <h2>Yorumlar</h2>
        <CommentForm movieId={movie.id} />
        <CommentList movieId={movie.id} />
      </section>
    </section>
  );
}

export default MovieDetailsPage;