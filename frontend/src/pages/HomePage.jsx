import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import movieService from "../services/movieService.js";
import { cityResource } from "../services/locationService.js";
import heroPoster from "../assets/hero.png";

import "./home.css";

function QuickTicketStrip({ movies, cities, onSubmit }) {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ city: selectedCity, movieId: selectedMovieId });
  }

  return (
    <form className="quick-ticket-strip" onSubmit={handleSubmit}>
      <label className="quick-ticket-field">
        <span>Şehir</span>
        <select
          className="input"
          value={selectedCity}
          onChange={(event) => setSelectedCity(event.target.value)}
        >
          <option value="">Şehir seç</option>
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <label className="quick-ticket-field">
        <span>Film</span>
        <select
          className="input"
          value={selectedMovieId}
          onChange={(event) => setSelectedMovieId(event.target.value)}
        >
          <option value="">Film seç</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
      </label>

      <label className="quick-ticket-field">
        <span>Tarih</span>
        {/* Backend'de şehir+film+tarih birleşik seans sorgusu yok (spec
            §11 — bu revizyon hiçbir backend değişikliği içermiyor), bu
            yüzden tarih şimdilik yalnızca bilgi amaçlı; "Seansları Bul"
            yönlendirmesi film/şehir seçimine göre çalışır. */}
        <input
          className="input"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </label>

      <button
        type="submit"
        className="btn btn--primary btn--md quick-ticket-submit"
      >
        Seansları Bul
      </button>
    </form>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => cityResource.list(),
    staleTime: 30 * 60 * 1000,
  });

  const activeMovies = movies.filter(
    (movie) => !movieService.isMovieArchived(movie)
  );
  const nowShowingMovies = activeMovies.filter((movie) =>
    movieService.isMovieReleased(movie)
  );
  const heroPosters = movieService
    .sortMovies(nowShowingMovies, "rating-desc")
    .slice(0, 3);

  const averageRating =
    activeMovies.length > 0
      ? activeMovies.reduce(
          (sum, movie) => sum + (movie.rating?.average ?? 0),
          0
        ) / activeMovies.length
      : 0;

  function handleQuickTicketSubmit({ city, movieId }) {
    if (movieId) {
      navigate(`/movies/${movieId}`);
      return;
    }

    if (city) {
      navigate("/cinemas", { state: { city } });
      return;
    }

    navigate("/movies");
  }

  return (
    <div className="landing">
      <section
        className="hero"
        style={{ backgroundImage: `url(${heroPoster})` }}
      >
        <div className="hero-inner">
          <div className="hero-message">
            <span className="hero-eyebrow">CineSeat</span>

            <h1 className="hero-title">
              Bileti telefonundan al, koltuğunu önceden seç.
            </h1>

            <p className="hero-description">
              Türkiye&apos;nin dört bir yanındaki sinemalardan saniyeler
              içinde bilet al, sırada beklemeden salona gir.
            </p>

            <div className="hero-actions">
              <Link to="/movies" className="btn btn--primary btn--lg">
                Bilet Al
              </Link>
            </div>

            <dl className="hero-stats">
              <div className="hero-stat">
                <dt>Film</dt>
                <dd data-testid="hero-stat-movies">
                  {moviesLoading ? "—" : activeMovies.length}
                </dd>
              </div>

              <div className="hero-stat">
                <dt>Şehir</dt>
                <dd data-testid="hero-stat-cities">{cities.length}</dd>
              </div>

              <div className="hero-stat">
                <dt>Kullanıcı Puanı</dt>
                <dd data-testid="hero-stat-rating">
                  {averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="hero-posters" aria-hidden="true">
            {heroPosters.map((movie, index) => (
              <img
                key={movie.id}
                src={movie.poster}
                alt=""
                className={`hero-poster hero-poster-${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <QuickTicketStrip
        movies={nowShowingMovies}
        cities={cities}
        onSubmit={handleQuickTicketSubmit}
      />
    </div>
  );
}

export default HomePage;
