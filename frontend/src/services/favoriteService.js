import apiClient from "./apiClient.js";

// Favoriler artık kullanıcı hesabına bağlı (GET/POST/DELETE /api/favorites).
// Önceden localStorage'daydı: kullanıcı telefondan girince listesi boştu.

function mapFavoriteDto(dto) {
  return {
    movieId: dto.movieId,
    title: dto.title,
    poster: dto.poster,
    avgScore: Number(dto.avgScore) || 0,
    addedAt: dto.addedAt,
  };
}

async function getMyFavorites({ pageSize = 100 } = {}) {
  const result = await apiClient.get(
    `/favorites?pageNumber=1&pageSize=${pageSize}`
  );

  return (result?.items ?? []).map(mapFavoriteDto);
}

async function addFavorite(movieId) {
  return apiClient.post("/favorites", { movieId });
}

async function removeFavorite(movieId) {
  return apiClient.del(`/favorites/${movieId}`);
}

const favoriteService = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
};

export default favoriteService;
