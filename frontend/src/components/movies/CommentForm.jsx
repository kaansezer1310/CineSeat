import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import useAuth from "../../hooks/useAuth.js";
import commentService from "../../services/commentService.js";

function CommentForm({ movieId }) {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const addCommentMutation = useMutation({
    mutationFn: (commentText) =>
      commentService.addComment(movieId, user, commentText),
    onSuccess: () => {
      setText("");
      setError("");
      queryClient.invalidateQueries({
        queryKey: ["comments", movieId],
      });
    },
    onError: (mutationError) => {
      setError(mutationError.message);
    },
  });

  if (role !== "member") {
    return (
      <p className="comment-guest-hint">
        Yorum yapmak için giriş yapın.
      </p>
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (addCommentMutation.isPending) {
      return;
    }

    addCommentMutation.mutate(text);
  }

  const trimmedLength = text.trim().length;
  const isTooShort = trimmedLength < commentService.MIN_LENGTH;
  const isTooLong = trimmedLength > commentService.MAX_LENGTH;

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor="comment-text">Yorumun</label>

      <textarea
        id="comment-text"
        className="comment-textarea"
        value={text}
        maxLength={commentService.MAX_LENGTH + 50}
        onChange={(event) => setText(event.target.value)}
        placeholder={`En az ${commentService.MIN_LENGTH} karakter yaz...`}
      />

      <div className="comment-form-footer">
        <span
          className={
            isTooShort || isTooLong
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
            isTooShort || isTooLong || addCommentMutation.isPending
          }
        >
          {addCommentMutation.isPending
            ? "Gönderiliyor..."
            : "Yorum Yap"}
        </button>
      </div>

      {error && <p className="comment-form-error">{error}</p>}
    </form>
  );
}

export default CommentForm;
