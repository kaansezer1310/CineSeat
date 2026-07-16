import MoviePoster from "./MoviePoster.jsx";

function MovieCard({ movie, onSelect }) {
  function handleCardClick() {
    onSelect(movie.id);
  }

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
            <span>{movie.releaseYear}</span>
            <strong>Seansları Gör</strong>
          </div>
        </div>
      </button>
    </article>
  );
}

export default MovieCard;