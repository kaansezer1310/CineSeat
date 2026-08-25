import apiClient from "./apiClient.js";
import { fetchAllPages } from "./adminResource.js";

// Gösterim formatı — backend `ScreeningFormat` enum'u (ad olarak taşınır).
export const SCREENING_FORMATS = [
  { value: "Standard2D", label: "2D" },
  { value: "Standard3D", label: "3D" },
  { value: "IMAX", label: "IMAX" },
  { value: "ScreenX", label: "ScreenX" },
];

export function getFormatLabel(value) {
  return SCREENING_FORMATS.find((f) => f.value === value)?.label ?? value;
}

function mapShowtimeDto(dto) {
  return {
    id: dto.id,
    movieId: dto.movieId,
    hallId: dto.hallId,
    startDatetime: dto.startDatetime,
    basePrice: Number(dto.basePrice) || 0,
    format: dto.format,
    hallName: dto.hallName ?? "",
    cinemaName: dto.cinemaName ?? "",
    totalSeats: dto.totalSeats ?? 0,
  };
}

/**
 * Seanslar yalnızca film ya da sinema kırılımında listelenebiliyor; düz bir
 * "tüm seanslar" ucu yok. Yönetim ekranı sinema kırılımını kullanıyor:
 * çakışma her zaman aynı salon içinde olduğu için, bir sinemanın seansları
 * yöneticinin bakması gereken doğal küme.
 */
const showtimeService = {
  async listByCinema(cinemaId) {
    // Sayfa boyutunu elle 200 veriyordu; sunucu en fazla 100 kabul ettigi icin
    // istek 400 ile donuyor, yonetim ekrani "Seanslar yukleniyor"da kaliyordu.
    // Bir sinemanin seanslari 100'u rahatlikla asabildigi icin cozum sinira
    // inmek degil, sayfalari dolasmak.
    const items = await fetchAllPages(`/showtimes/by-cinema/${cinemaId}`);

    return items.map(mapShowtimeDto);
  },

  async create(values) {
    return apiClient.post("/showtimes", toCommand(values));
  },

  async update(id, values) {
    return apiClient.put(`/showtimes/${id}`, {
      id: Number(id),
      ...toCommand(values),
    });
  },

  async remove(id) {
    return apiClient.del(`/showtimes/${id}`);
  },
};

function toCommand(values) {
  return {
    movieId: Number(values.movieId),
    hallId: Number(values.hallId),
    // `datetime-local` girdisi saat dilimi taşımaz; tarayıcının yerel
    // saatinde okunup ISO'ya (offsetli) çevriliyor.
    startDatetime: new Date(values.startDatetime).toISOString(),
    basePrice: Number(values.basePrice),
    format: values.format,
  };
}

export default showtimeService;
