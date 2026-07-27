import seedComments from "../data/comments.js";
import { ValidationError, NotFoundError, ForbiddenError } from "./errors.js";

const COMMENTS_STORAGE_KEY = "cineseat-comments";

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

// Basit, örnek amaçlı yasaklı kelime listesi (REQ-11.1). Küçük/büyük harf
// duyarsız, alt dize (substring) eşleşmesiyle kontrol edilir.
const BANNED_WORDS = ["aptal", "salak", "gerizekalı"];

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function getStoredComments() {
  const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveStoredComments(comments) {
  localStorage.setItem(
    COMMENTS_STORAGE_KEY,
    JSON.stringify(comments)
  );
}

function findBannedWord(text) {
  const lowerText = text.toLocaleLowerCase("tr-TR");

  return BANNED_WORDS.find((word) => {
    return lowerText.includes(word.toLocaleLowerCase("tr-TR"));
  });
}

function validateCommentText(text) {
  const trimmed = (text ?? "").trim();

  if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
    throw new ValidationError(
      `Yorum ${MIN_LENGTH}-${MAX_LENGTH} karakter arasında olmalıdır.`
    );
  }

  const bannedWord = findBannedWord(trimmed);

  if (bannedWord) {
    throw new ValidationError(
      "Yorumun uygunsuz kelime(ler) içerdiği tespit edildi."
    );
  }

  return trimmed;
}

async function getCommentsByMovieId(movieId) {
  await wait(300);

  const numericMovieId = Number(movieId);

  const allComments = [
    ...seedComments,
    ...getStoredComments(),
  ];

  // Yeniden eskiye — en güncel yorum en üstte (REQ-11).
  return allComments
    .filter((comment) => comment.movieId === numericMovieId)
    .sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

async function addComment(movieId, user, text) {
  await wait(400);

  const validatedText = validateCommentText(text);

  const newComment = {
    id: `comment-${Date.now()}`,
    movieId: Number(movieId),
    userId: user.id,
    userName: user.name,
    text: validatedText,
    createdAt: new Date().toISOString(),
  };

  const storedComments = getStoredComments();

  saveStoredComments([...storedComments, newComment]);

  return newComment;
}

async function updateComment(commentId, userId, text) {
  await wait(400);

  const validatedText = validateCommentText(text);
  const storedComments = getStoredComments();

  const index = storedComments.findIndex((comment) => {
    return comment.id === commentId;
  });

  if (index === -1) {
    throw new NotFoundError("Yorum bulunamadı.");
  }

  if (storedComments[index].userId !== userId) {
    throw new ForbiddenError("Yalnızca kendi yorumunu düzenleyebilirsin.");
  }

  const updatedComment = {
    ...storedComments[index],
    text: validatedText,
  };

  const updatedComments = [...storedComments];
  updatedComments[index] = updatedComment;

  saveStoredComments(updatedComments);

  return updatedComment;
}

async function deleteComment(commentId, userId) {
  await wait(300);

  const storedComments = getStoredComments();

  const target = storedComments.find((comment) => {
    return comment.id === commentId;
  });

  if (!target) {
    throw new NotFoundError("Yorum bulunamadı.");
  }

  if (target.userId !== userId) {
    throw new ForbiddenError("Yalnızca kendi yorumunu silebilirsin.");
  }

  saveStoredComments(
    storedComments.filter((comment) => comment.id !== commentId)
  );

  return true;
}

const commentService = {
  getCommentsByMovieId,
  addComment,
  updateComment,
  deleteComment,
  MIN_LENGTH,
  MAX_LENGTH,
};

export default commentService;
