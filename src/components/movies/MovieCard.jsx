import MoviePoster from "./MoviePoster.jsx";
import movieService from "../../services/movieService.js";

const releaseDateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDaysRemainingLabel(daysRemaining) {
  if (daysRemaining <= 0) {
    return "Bugün vizyonda";
  }

  if (daysRemaining === 1) {
    return "Yarın vizyonda";
  }

  return `Vizyona ${daysRemaining} gün kaldı`;
}

function MovieCard({ movie, onSelect }) {
  function handleCardClick() {
    onSelect(movie.id);
  }

  const isUpcoming = !movieService.isMovieReleased(movie);

  return (
    <article className="movie-card">
      <button
        className="movie-card-button"
        type="button"
        onClick={handleCardClick}
      >
        <div className="movie-poster-wrapper">
          <MoviePoster
            key={movie.poster}
            movie={movie}
            className="movie-poster"
          />

          <span className="movie-age-rating">
            {movie.ageRating}
          </span>
        </div>

        <div className="movie-card-content">
          <div className="movie-card-topline">
            <span>{movie.genre}</span>
            <span>{movie.duration} dk.</span>
          </div>

          <h2>{movie.title}</h2>

          <p>{movie.description}</p>

          <div className="movie-card-footer">
            {isUpcoming ? (
              <>
                <span>
                  {releaseDateFormatter.format(
                    movieService.parseIsoDateOnly(
                      movie.releaseDate
                    )
                  )}
                </span>

                <strong>
                  {formatDaysRemainingLabel(
                    movieService.getDaysUntilRelease(movie)
                  )}
                </strong>
              </>
            ) : (
              <>
                <span>{movie.releaseYear}</span>
                <strong>Seansları Gör</strong>
              </>
            )}
          </div>
        </div>
      </button>
    </article>
  );
}

export default MovieCard;
