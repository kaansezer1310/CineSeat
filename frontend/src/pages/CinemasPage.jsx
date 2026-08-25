import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import PageHeader from '../components/ui/PageHeader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatusPanel from '../components/ui/StatusPanel.jsx';
import cinemaService from '../services/cinemaService.js';
import './cinemas.css';

const ALL_CITIES = "Tümü";

// Haversine Formülü (İki koordinat arası mesafe hesaplar - km cinsinden)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export default function CinemasPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(() => {
    return "geolocation" in navigator
      ? "Konum aranıyor..."
      : "Tarayıcınız konum özelliğini desteklemiyor. Şehir seçerek sinemaları görebilirsiniz.";
  });

  // Sinemalar ve şehirler artık veritabanından geliyor (önceden dosya içinde
  // sabit bir diziydi; gerçek sinema kayıtlarını hiç göstermiyordu).
  const {
    data: cinemas = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cinemas"],
    queryFn: cinemaService.getCinemas,
    staleTime: 5 * 60 * 1000,
  });

  const cities = [
    ALL_CITIES,
    ...new Set(cinemas.map((cinema) => cinema.city).filter(Boolean)),
  ];

  useEffect(() => {
    // Sayfa açıldığında konum iste
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Kullanıcı izin verdi
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus("Konumunuz bulundu. Size en yakın sinemalar hesaplandı.");
      },
      (error) => {
        // Kullanıcı reddetti veya hata oluştu (Fallback) — Tümü seçili kalır, kullanıcı isterse şehir seçer
        console.error("Konum bilgisi alınamadı:", error);
        setLocationStatus("Konum izni verilmedi. Tüm sinemalar listeleniyor, dilerseniz şehir seçerek daraltabilirsiniz.");
      }
    );
  }, []);

  // sessions.js'deki seans kayıtları herhangi bir cinemaId/hallName eşlemesi
  // içermediği için (bkz. src/data/sessions.js), belirli bir şubeye özel
  // seans listesine yönlendirme şu an veri modelinde mümkün değil. Bu yüzden
  // kullanıcıyı film/seans seçimine başladığı genel akışa (ana sayfa) götürür.
  // Gerçek "bu şubenin seansları" filtrelemesi için sessions.js'e bir
  // cinemaId alanı eklenmesi gerekir.
  function handleViewSessions() {
    navigate("/");
  }

  // Sinemaları filtrele ve mesafe hesapla
  let filteredCinemas = cinemas;

  if (selectedCity !== ALL_CITIES) {
    filteredCinemas = filteredCinemas.filter(c => c.city === selectedCity);
  }

  // Eğer kullanıcı konumu varsa mesafeleri ekle ve sırala
  if (userLocation) {
    filteredCinemas = filteredCinemas.map(cinema => {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, cinema.lat, cinema.lng);
      return { ...cinema, distance };
    }).sort((a, b) => a.distance - b.distance); // En yakından en uzağa
  }

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
