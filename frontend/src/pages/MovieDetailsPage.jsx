import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MoviePoster from "../components/movies/MoviePoster.jsx";
import TrailerModal from "../components/movies/TrailerModal.jsx";
import CommentForm from "../components/movies/CommentForm.jsx";
import CommentList from "../components/movies/CommentList.jsx";
import SessionList from "../components/sessions/SessionList.jsx";
import movieService from "../services/movieService.js";
import sessionService from "../services/sessionService.js";
import useWatchlist from "../hooks/useWatchlist.js";

const DETAIL_TABS = [
  { id: "sessions", label: "Seanslar" },
  { id: "about", label: "Hakkında" },
  { id: "comments", label: "Yorumlar" },
];

function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useWatchlist();

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("sessions");

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
    <section className="movie-details-page">
      {movie.poster && (
        <div
          className="movie-details-backdrop"
          style={{ backgroundImage: `url(${movie.poster})` }}
          aria-hidden="true"
        />
      )}

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

          <div className="movie-details-title-row">
            <h1>{movie.title}</h1>
            <button
              type="button"
              className={`watchlist-heart-button watchlist-heart-button--large ${isFavorite(movie.id) ? 'watchlist-heart-button--active' : 'watchlist-heart-button--inactive'}`}
              onClick={() => toggleFavorite(movie.id)}
              title={isFavorite(movie.id) ? "İzleme listesinden çıkar" : "İzleme listesine ekle"}
              aria-label="Favori Ekle/Çıkar"
            >
              {isFavorite(movie.id) ? "♥" : "♡"}
            </button>
          </div>

          <div className="movie-details-meta">
            <span className="chip">{movie.releaseYear}</span>
            <span className="chip">{movie.duration} dakika</span>
            <span className="chip">{movie.ageRating}</span>
          </div>

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
        </div>
      </div>

      {isTrailerOpen && movie.fragmanYoutubeId && (
        <TrailerModal
          youtubeId={movie.fragmanYoutubeId}
          movieTitle={movie.title}
          onClose={() => setIsTrailerOpen(false)}
        />
      )}

      <div className="movie-tab-list" role="tablist" aria-label="Film detay sekmeleri">
        {DETAIL_TABS.map((tab) => {
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

      <div hidden={activeTab !== "sessions"}>
        <SessionList
          sessions={sessions}
          onSessionSelect={handleSessionSelect}
        />
      </div>

      <div className="movie-details-about" hidden={activeTab !== "about"}>
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

      {/* T10: puan ve yorum tek kayıt — ayrı bir puanlama bölümü yok,
          yıldız yorum formunun içinde. REQ-11 gereği yalnızca vizyondaki
          filmlerde değerlendirme yapılabilir; vizyona girmemiş bir filme
          puan verilemez. */}
      <section className="movie-details-social" hidden={activeTab !== "comments"}>
        <h2>Değerlendirmeler</h2>

        {movieService.isMovieReleased(movie) ? (
          <CommentForm movieId={movie.id} />
        ) : (
          <p className="comment-guest-hint">
            Film vizyona girdiğinde puan verebilir ve yorum yazabilirsin.
          </p>
        )}

        <CommentList movieId={movie.id} />
      </section>
    </section>
  );
}

export default MovieDetailsPage;
