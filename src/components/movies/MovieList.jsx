import MovieCard from "./MovieCard.jsx";

function MovieList({ movies, onMovieSelect }) {
  return (
    <div className="movie-grid">
      {movies.map((movie) => {
        return (
          <MovieCard
            key={movie.id}
            movie={movie}
            onSelect={onMovieSelect}
          />
        );
      })}
    </div>
  );
}

export default MovieList;