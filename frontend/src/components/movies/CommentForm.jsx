import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAuth from "../../hooks/useAuth.js";
import commentService from "../../services/commentService.js";

const STAR_VALUES = [1, 2, 3, 4, 5];

// T10: yıldız zorunlu, metin isteğe bağlı. Puan ve yorum tek kayıt olduğu
// için ikisi de aynı formdan gönderilir.
function CommentForm({ movieId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const addCommentMutation = useMutation({
    mutationFn: () =>
      commentService.addComment(movieId, { rating, content: text }),
    onSuccess: () => {
      setText("");
      setRating(0);
      setError("");

      queryClient.invalidateQueries({ queryKey: ["comments", movieId] });
      // Ortalama puan film kaydında tutuluyor; yorum eklenince değişir.
      queryClient.invalidateQueries({ queryKey: ["movie", movieId] });
    },
    onError: (mutationError) => {
      setError(mutationError.message);
    },
  });

  if (!user) {
    return (
      <p className="comment-guest-hint">
        Puan vermek ve yorum yapmak için giriş yapın.
      </p>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (addCommentMutation.isPending) {
      return;
    }

    addCommentMutation.mutate();
  }

  const trimmedLength = text.trim().length;
  const isTooLong = trimmedLength > commentService.MAX_LENGTH;
  const hasRating = rating >= 1;

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <fieldset className="comment-rating-field">
        <legend>Puanın *</legend>

        <div
          className="comment-rating-stars"
          onMouseLeave={() => setHoveredStar(0)}
        >
          {STAR_VALUES.map((value) => {
            const isFilled = value <= (hoveredStar || rating);

            return (
              <button
                key={value}
                type="button"
                className={
                  isFilled
                    ? "rating-star rating-star-filled"
                    : "rating-star"
                }
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredStar(value)}
                aria-pressed={value === rating}
                aria-label={`${value} yıldız ver`}
              >
                ★
              </button>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor="comment-text">
        Yorumun <span className="comment-optional-hint">(isteğe bağlı)</span>
      </label>

      <textarea
        id="comment-text"
        className="comment-textarea"
        value={text}
        maxLength={commentService.MAX_LENGTH + 50}
        onChange={(event) => setText(event.target.value)}
        placeholder="Dilersen birkaç cümle yaz…"
      />

      <div className="comment-form-footer">
        <span
          className={
            isTooLong
              ? "comment-char-counter comment-char-counter-invalid"
              : "comment-char-counter"
          }
        >
          {trimmedLength} / {commentService.MAX_LENGTH}
        </span>

        <button
          className="primary-button"
          type="submit"
          disabled={
            !hasRating || isTooLong || addCommentMutation.isPending
          }
        >
          {addCommentMutation.isPending ? "Gönderiliyor..." : "Gönder"}
        </button>
      </div>

      {!hasRating && (
        <p className="comment-form-hint">
          Göndermek için önce bir yıldız seç.
        </p>
      )}

      {error && <p className="comment-form-error">{error}</p>}
    </form>
  );
}

export default CommentForm;
