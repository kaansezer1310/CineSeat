import apiClient from "./apiClient.js";

// T10: puan zorunlu (1–5), yorum metni İSTEĞE BAĞLI ve puan aynı `Comment`
// kaydında tutuluyor. Ayrı bir `ratingService` yok — iki ayrı depoda
// tutulan puanlar birbirinden ayrışıyordu.
export const MAX_LENGTH = 1000;

function mapCommentDto(dto) {
  return {
    id: dto.id,
    movieId: dto.movieId,
    userId: dto.userId,
    userName: dto.username,
    rating: dto.rating,
    text: dto.content ?? "",
    isEdited: dto.isEdited,
    createdAt: dto.createdAt,
  };
}

async function getCommentsByMovieId(movieId, { pageSize = 50 } = {}) {
  const result = await apiClient.get(
    `/comments?movieId=${movieId}&pageNumber=1&pageSize=${pageSize}`
  );

  return (result?.items ?? []).map(mapCommentDto);
}

/**
 * Filme puan (ve isteğe bağlı yorum) ekler.
 * Backend kullanıcı/film başına tek kayda izin verir; ikinci deneme 409 döner.
 */
async function addComment(movieId, { rating, content }) {
  const trimmed = (content ?? "").trim();

  return apiClient.post("/comments", {
    movieId,
    rating,
    content: trimmed.length > 0 ? trimmed : null,
  });
}

/**
 * Yorum siler. Backend, kaydın sahibi ile `comment.moderate` iznine sahip
 * kullanıcıyı aynı uçta ayırt eder — ayrı bir moderasyon ucu yok.
 */
async function deleteComment(commentId) {
  return apiClient.del(`/comments/${commentId}`);
}

const commentService = {
  getCommentsByMovieId,
  addComment,
  deleteComment,
  MAX_LENGTH,
};

export default commentService;
