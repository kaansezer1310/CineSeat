import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import useAuth from "../../hooks/useAuth.js";
import commentService from "../../services/commentService.js";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// Tohum (mock) yorumlar `seed-` önekiyle geliyor ve düzenlenemez/silinemez —
// gerçek bir kullanıcıya ait olmayan, demo/geçmiş veri olarak davranılır.
// Yalnızca kullanıcının KENDİ eklediği (`comment-` önekli) yorumlar, aynı
// kullanıcı tarafından düzenlenebilir/silinebilir.
function isOwnEditableComment(comment, user) {
  return (
    Boolean(user) &&
    comment.userId === user.id &&
    comment.id.startsWith("comment-")
  );
}

function CommentList({ movieId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", movieId],
    queryFn: () => commentService.getCommentsByMovieId(movieId),
    staleTime: 10 * 1000,
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, text }) =>
      commentService.updateComment(commentId, user.id, text),
    onSuccess: () => {
      setEditingCommentId(null);
      queryClient.invalidateQueries({
        queryKey: ["comments", movieId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) =>
      commentService.deleteComment(commentId, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", movieId],
      });
    },
  });

  function startEditing(comment) {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  }

  function handleSaveEdit(commentId) {
    updateCommentMutation.mutate({
      commentId,
      text: editingText,
    });
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
        Henüz yorum yapılmamış. İlk yorumu sen yaz!
      </p>
    );
  }

  return (
    <ul className="comment-list">
      {comments.map((comment) => {
        const isEditing = editingCommentId === comment.id;
        const canModify = isOwnEditableComment(comment, user);

        return (
          <li className="comment-item" key={comment.id}>
            <div className="comment-item-header">
              <strong>{comment.userName}</strong>
              <span className="comment-item-date">
                {dateFormatter.format(new Date(comment.createdAt))}
              </span>
            </div>

            {isEditing ? (
              <div className="comment-edit-form">
                <textarea
                  className="comment-textarea"
                  value={editingText}
                  onChange={(event) =>
                    setEditingText(event.target.value)
                  }
                />

                <div className="comment-edit-actions">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={updateCommentMutation.isPending}
                  >
                    Kaydet
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setEditingCommentId(null)}
                  >
                    Vazgeç
                  </button>
                </div>

                {updateCommentMutation.isError && (
                  <p className="comment-form-error">
                    {updateCommentMutation.error.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="comment-item-text">{comment.text}</p>
            )}

            {canModify && !isEditing && (
              <div className="comment-item-actions">
                <button
                  type="button"
                  className="comment-action-button"
                  onClick={() => startEditing(comment)}
                >
                  Düzenle
                </button>

                <button
                  type="button"
                  className="comment-action-button"
                  onClick={() =>
                    deleteCommentMutation.mutate(comment.id)
                  }
                  disabled={deleteCommentMutation.isPending}
                >
                  Sil
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default CommentList;
