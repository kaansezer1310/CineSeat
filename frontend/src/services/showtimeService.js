import apiClient from "./apiClient.js";

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
  async listByCinema(cinemaId, { pageSize = 200 } = {}) {
    const result = await apiClient.get(
      `/showtimes/by-cinema/${cinemaId}?pageNumber=1&pageSize=${pageSize}`
    );

    return (result?.items ?? []).map(mapShowtimeDto);
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
