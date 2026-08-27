import MoviePoster from "./MoviePoster.jsx";
import movieService from "../../services/movieService.js";

import "./RailMovieCard.css";

function formatMeta(movie) {
  if (!movieService.isMovieReleased(movie)) {
    const daysRemaining = movieService.getDaysUntilRelease(movie);

    if (daysRemaining <= 0) {
      return "Bugün vizyonda";
    }

    if (daysRemaining === 1) {
      return "Yarın vizyonda";
    }

    return `${daysRemaining} gün sonra`;
  }

  return movie.genre;
}

function RailMovieCard({ movie, onSelect }) {
  return (
    <article className="rail-movie-card" role="listitem">
      <button
        type="button"
        className="rail-movie-card-button"
        onClick={() => onSelect(movie.id)}
      >
        <MoviePoster
          key={movie.poster}
          movie={movie}
          className="rail-movie-card-poster"
        />

        <span className="rail-movie-card-title">{movie.title}</span>
        <span className="rail-movie-card-meta">{formatMeta(movie)}</span>
      </button>
    </article>
  );
}

export default RailMovieCard;
