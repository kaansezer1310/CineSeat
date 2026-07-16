import { useState } from "react";

function MoviePoster({ movie, className }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !movie.poster) {
    return (
      <div
        className={`${className} movie-poster-fallback`}
        role="img"
        aria-label={`${movie.title} film posteri bulunamadı`}
      >
        Film posteri bulunamadı
      </div>
    );
  }

  return (
    <img
      className={className}
      src={movie.poster}
      alt={`${movie.title} film posteri`}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

export default MoviePoster;
