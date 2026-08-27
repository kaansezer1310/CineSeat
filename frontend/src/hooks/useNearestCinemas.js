import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import cinemaService from "../services/cinemaService.js";

// Haversine Formülü (İki koordinat arası mesafe hesaplar - km cinsinden)
// CinemasPage.jsx'ten değişmeden taşındı.
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function useNearestCinemas() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(() =>
    navigator.geolocation
      ? "Konum aranıyor..."
      : "Tarayıcınız konum özelliğini desteklemiyor. Şehir seçerek sinemaları görebilirsiniz."
  );

  const {
    data: cinemas = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cinemas"],
    queryFn: cinemaService.getCinemas,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus(
          "Konumunuz bulundu. Size en yakın sinemalar hesaplandı."
        );
      },
      (error) => {
        console.error("Konum bilgisi alınamadı:", error);
        setLocationStatus(
          "Konum izni verilmedi. Tüm sinemalar listeleniyor, dilerseniz şehir seçerek daraltabilirsiniz."
        );
      }
    );
  }, []);

  const cinemasWithDistance = userLocation
    ? cinemas
        .map((cinema) => ({
          ...cinema,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            cinema.lat,
            cinema.lng
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
    : cinemas;

  return {
    cinemas: cinemasWithDistance,
    isLoading,
    error,
    locationStatus,
    hasLocation: Boolean(userLocation),
  };
}

export default useNearestCinemas;
