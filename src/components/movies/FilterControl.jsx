export const ALL_VALUE = "all";

function FilterControl({
  genres,
  ageRatings,
  selectedGenre,
  selectedAgeRating,
  onGenreChange,
  onAgeRatingChange,
}) {
  return (
    <div className="movie-filter-control">
      <label>
        <span>Tür</span>

        <select
          className="movie-filter-select"
          value={selectedGenre}
          onChange={(event) => onGenreChange(event.target.value)}
        >
          <option value={ALL_VALUE}>Tümü</option>

          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Yaş Sınırı</span>

        <select
          className="movie-filter-select"
          value={selectedAgeRating}
          onChange={(event) => onAgeRatingChange(event.target.value)}
        >
          <option value={ALL_VALUE}>Tümü</option>

          {ageRatings.map((ageRating) => (
            <option key={ageRating} value={ageRating}>
              {ageRating}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default FilterControl;
