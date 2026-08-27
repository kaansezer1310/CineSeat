import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import movieService from "../services/movieService.js";
import campaignService, {
  formatCampaignValue,
} from "../services/campaignService.js";
import { cityResource } from "../services/locationService.js";
import useNearestCinemas from "../hooks/useNearestCinemas.js";
import Rail from "../components/ui/Rail.jsx";
import RailMovieCard from "../components/movies/RailMovieCard.jsx";
import StatusPanel from "../components/ui/StatusPanel.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import heroPoster from "../assets/hero.png";

import "./home.css";

const HOW_IT_WORKS_STEPS = [
  {
    title: "Filmini seç",
    description:
      "Vizyondaki ve yakında gelecek filmler arasından birini seç.",
  },
  {
    title: "Koltuğunu seç",
    description: "Salon haritasından istediğin koltuğu işaretle.",
  },
  {
    title: "Biletin hazır",
    description: "Ödemeni tamamla, biletin anında hesabına düşsün.",
  },
];

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
        <span>
          Tarih <span className="quick-ticket-hint">(yakında)</span>
        </span>
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

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", "active"],
    queryFn: campaignService.getActiveCampaigns,
    staleTime: 5 * 60 * 1000,
  });

  const {
    cinemas: nearestCinemas,
    isLoading: cinemasLoading,
    hasLocation,
  } = useNearestCinemas();

  const activeMovies = movies.filter(
    (movie) => !movieService.isMovieArchived(movie)
  );
  const nowShowingMovies = activeMovies.filter((movie) =>
    movieService.isMovieReleased(movie)
  );
  const comingSoonMovies = activeMovies.filter(
    (movie) =>
      !movieService.isMovieReleased(movie) &&
      movieService.isWithinComingSoonWindow(movie)
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

  function handleMovieSelect(movieId) {
    navigate(`/movies/${movieId}`);
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

      <Rail
        title="Vizyondaki Filmler"
        viewAllHref="/movies"
        ariaLabel="Vizyondaki filmler"
        isList={!moviesLoading && nowShowingMovies.length > 0}
      >
        {moviesLoading ? (
          <StatusPanel variant="loading" title="Filmler yükleniyor…" />
        ) : nowShowingMovies.length === 0 ? (
          <EmptyState icon="🎬" title="Şu anda vizyonda film bulunmuyor." />
        ) : (
          nowShowingMovies
            .slice(0, 12)
            .map((movie) => (
              <RailMovieCard
                key={movie.id}
                movie={movie}
                onSelect={handleMovieSelect}
              />
            ))
        )}
      </Rail>

      <Rail
        title="Yakında"
        viewAllHref="/movies"
        ariaLabel="Yakında vizyona girecek filmler"
        isList={!moviesLoading && comingSoonMovies.length > 0}
      >
        {moviesLoading ? (
          <StatusPanel variant="loading" title="Filmler yükleniyor…" />
        ) : comingSoonMovies.length === 0 ? (
          <EmptyState
            icon="🎬"
            title="Yakında vizyona girecek film bulunmuyor."
          />
        ) : (
          comingSoonMovies
            .slice(0, 12)
            .map((movie) => (
              <RailMovieCard
                key={movie.id}
                movie={movie}
                onSelect={handleMovieSelect}
              />
            ))
        )}
      </Rail>

      {campaigns.length > 0 && (
        <section className="landing-section" aria-label="Kampanyalar">
          <div className="rail-section-heading">
            <h2 className="rail-section-title">Kampanyalar</h2>
          </div>

          <div className="campaign-grid">
            {campaigns.slice(0, 3).map((campaign) => (
              <article key={campaign.id} className="campaign-card">
                <span className="badge badge--accent">
                  {formatCampaignValue(campaign)}
                </span>

                <h3 className="campaign-card-title">{campaign.name}</h3>

                <p className="campaign-card-condition">
                  {campaign.minCartTotal > 0
                    ? `${campaign.minCartTotal.toFixed(2)} TL ve üzeri sepetlerde geçerli`
                    : "Tüm sepetlerde geçerli"}
                </p>

                {campaign.membersOnly && (
                  <span className="badge badge--neutral">
                    Yalnızca üyelere özel
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="landing-section" aria-label="Sana yakın sinemalar">
        <div className="rail-section-heading">
          <h2 className="rail-section-title">Sana Yakın Sinemalar</h2>
          <Link to="/cinemas" className="rail-section-link">
            Tümünü gör →
          </Link>
        </div>

        {cinemasLoading ? (
          <StatusPanel variant="loading" title="Sinemalar yükleniyor…" />
        ) : !hasLocation ? (
          <EmptyState
            icon="📍"
            title="Size en yakın sinemaları göstermek için konum izni gerekiyor."
            description="Tarayıcı konum izni verirsen sana en yakın sinemaları burada gösterebiliriz."
            action={
              <Link to="/cinemas" className="btn btn--secondary btn--sm">
                Tüm sinemaları gör
              </Link>
            }
          />
        ) : (
          <div className="nearby-cinemas-grid">
            {nearestCinemas.slice(0, 3).map((cinema) => (
              <article key={cinema.id} className="nearby-cinema-card">
                <h3>{cinema.name}</h3>
                <p className="nearby-cinema-city">{cinema.city}</p>
                <p className="nearby-cinema-distance">
                  {cinema.distance.toFixed(1)} km uzaklıkta
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="landing-section" aria-label="Nasıl çalışır">
        <div className="rail-section-heading">
          <h2 className="rail-section-title">Nasıl Çalışır?</h2>
        </div>

        <ol className="how-it-works-list">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title} className="how-it-works-step">
              <span className="how-it-works-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default HomePage;
