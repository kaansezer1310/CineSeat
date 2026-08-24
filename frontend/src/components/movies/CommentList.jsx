import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import useAuth from "../../hooks/useAuth.js";
import commentService from "../../services/commentService.js";
import { PERMISSIONS } from "../../constants/permissions.js";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function RatingBadge({ rating }) {
  return (
    <span
      className="comment-item-rating"
      aria-label={`${rating} yıldız`}
      title={`${rating} / 5`}
    >
      <span aria-hidden="true">{"★".repeat(rating)}</span>
      <span aria-hidden="true" className="comment-item-rating-empty">
        {"★".repeat(Math.max(0, 5 - rating))}
      </span>
    </span>
  );
}

function CommentList({ movieId }) {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", movieId],
    queryFn: () => commentService.getCommentsByMovieId(movieId),
    staleTime: 10 * 1000,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", movieId] });
      queryClient.invalidateQueries({ queryKey: ["movie", movieId] });
    },
  });

  // Backend düzenleme ucu sunmuyor (yalnızca ekle/sil); bu yüzden düzenleme
  // arayüzü de yok. Silme yetkisi ise iki kaynaktan gelebilir: kaydın sahibi
  // olmak ya da `comment.moderate` iznine sahip olmak.
  const canModerate = hasPermission(PERMISSIONS.COMMENT_MODERATE);

  function canDelete(comment) {
    return Boolean(user) && (comment.userId === user.id || canModerate);
  }

  if (isLoading) {
    return <p className="comment-list-status">Yorumlar yükleniyor...</p>;
  }

  if (error) {
    return (
      <p className="comment-list-status">
        Yorumlar alınamadı: {error.message}
      </p>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="comment-list-status">
        Henüz puan verilmemiş. İlk değerlendirmeyi sen yap!
      </p>
    );
  }

  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li className="comment-item" key={comment.id}>
          <div className="comment-item-header">
            <strong>{comment.userName}</strong>

            <RatingBadge rating={comment.rating} />

            <span className="comment-item-date">
              {dateFormatter.format(new Date(comment.createdAt))}
            </span>
          </div>

          {/* T10: metin isteğe bağlı — yalnızca puan verilmiş olabilir. */}
          {comment.text ? (
            <p className="comment-item-text">{comment.text}</p>
          ) : (
            <p className="comment-item-text comment-item-text-empty">
              Yorum yazılmamış, yalnızca puan verilmiş.
            </p>
          )}

          {canDelete(comment) && (
            <div className="comment-item-actions">
              <button
                type="button"
                className="comment-action-button"
                onClick={() => deleteCommentMutation.mutate(comment.id)}
                disabled={deleteCommentMutation.isPending}
              >
                Sil
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
