import { useState, useEffect } from 'react';
import './cinemas.css';

// Mock Data: Sinema Şubeleri
const CINEMAS = [
  { id: 1, name: "CineSeat İstanbul Merkez", city: "İstanbul", lat: 41.0082, lng: 28.9784 },
  { id: 2, name: "CineSeat Kadıköy", city: "İstanbul", lat: 40.9819, lng: 29.0233 },
  { id: 3, name: "CineSeat Ankara Kızılay", city: "Ankara", lat: 39.9208, lng: 32.8541 },
  { id: 4, name: "CineSeat İzmir Alsancak", city: "İzmir", lat: 38.4237, lng: 27.1428 },
  { id: 5, name: "CineSeat Antalya Muratpaşa", city: "Antalya", lat: 36.8969, lng: 30.7133 },
];

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
  const [selectedCity, setSelectedCity] = useState("Tümü");
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(() => {
    return "geolocation" in navigator
      ? "Konum aranıyor..."
      : "Tarayıcınız konum özelliğini desteklemiyor. Şehir seçerek sinemaları görebilirsiniz.";
  });

  // Benzersiz şehirleri al
  const cities = ["Tümü", ...new Set(CINEMAS.map(c => c.city))];

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

  // Sinemaları filtrele ve mesafe hesapla
  let filteredCinemas = CINEMAS;

  if (selectedCity !== "Tümü") {
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
    <div className="page-container cinemas-page">
      <div className="page-heading-row">
        <div className="page-heading">
          <p className="page-label">LOKASYONLAR</p>
          <h1>Sinemalarımız</h1>
          <p>{locationStatus}</p>
        </div>
      </div>

      <div className="cinemas-filter">
        <label>Şehir Seçin: </label>
        <select 
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
        {filteredCinemas.map(cinema => (
          <div key={cinema.id} className="cinema-card">
            <h3>{cinema.name}</h3>
            <p className="cinema-city">📍 {cinema.city}</p>
            {cinema.distance !== undefined && (
              <p className="cinema-distance">
                Size uzaklığı: <strong>{cinema.distance.toFixed(1)} km</strong>
              </p>
            )}
            <button className="secondary-button" style={{ marginTop: '14px' }}>
              Seansları Gör
            </button>
          </div>
        ))}
        {filteredCinemas.length === 0 && (
          <p>Bu şehirde henüz sinemamız bulunmuyor.</p>
        )}
      </div>
    </div>
  );
}
