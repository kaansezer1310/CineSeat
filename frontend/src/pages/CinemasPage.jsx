import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../components/ui/PageHeader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatusPanel from '../components/ui/StatusPanel.jsx';
import useNearestCinemas from '../hooks/useNearestCinemas.js';
import './cinemas.css';

const ALL_CITIES = "Tümü";

export default function CinemasPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);

  const { cinemas, isLoading, error, locationStatus } = useNearestCinemas();

  const cities = [
    ALL_CITIES,
    ...new Set(cinemas.map((cinema) => cinema.city).filter(Boolean)),
  ];

  // sessions.js'deki seans kayıtları herhangi bir cinemaId/hallName eşlemesi
  // içermediği için (bkz. src/data/sessions.js), belirli bir şubeye özel
  // seans listesine yönlendirme şu an veri modelinde mümkün değil. Bu yüzden
  // kullanıcıyı film seçimine başladığı genel akışa (/movies) götürür.
  // Gerçek "bu şubenin seansları" filtrelemesi için sessions.js'e bir
  // cinemaId alanı eklenmesi gerekir.
  function handleViewSessions() {
    navigate("/movies");
  }

  const filteredCinemas =
    selectedCity === ALL_CITIES
      ? cinemas
      : cinemas.filter((cinema) => cinema.city === selectedCity);

  return (
    <div className="cinemas-page">
      {/* T9: sekme değil kendi rotası olduğu için başlık artık burada. */}
      <PageHeader
        title="Sinemalarımız"
        description="Size en yakın sinemaları keşfedin ve detayları görün."
      />

      <p className="cinemas-location-status">{locationStatus}</p>

      {error && (
        <StatusPanel
          variant="error"
          title="Sinemalar alınamadı"
          description={error.message}
        />
      )}

      <div className="cinemas-filter">
        <label htmlFor="cinemas-city-select">Şehir Seçin: </label>
        <select
          id="cinemas-city-select"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="city-select"
        >
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="cinemas-grid">
        {isLoading && (
          <StatusPanel variant="loading" title="Sinemalar yükleniyor…" />
        )}

        {filteredCinemas.map(cinema => (
          <div key={cinema.id} className="cinema-card">
            <h3>{cinema.name}</h3>
            <p className="cinema-city">{cinema.city}</p>
            {cinema.distance !== undefined && (
              <p className="cinema-distance">
                Size uzaklığı: <strong>{cinema.distance.toFixed(1)} km</strong>
              </p>
            )}
            <button
              className="secondary-button cinema-card-action"
              type="button"
              onClick={handleViewSessions}
            >
              Seansları Gör
            </button>
          </div>
        ))}
        {!isLoading && !error && filteredCinemas.length === 0 && (
          <EmptyState
            icon="🎦"
            title="Bu şehirde henüz sinemamız bulunmuyor."
            description="Başka bir şehir seçerek yakınınızdaki salonlara bakabilirsiniz."
          />
        )}
      </div>
    </div>
  );
}
