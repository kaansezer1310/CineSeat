import movies from "../data/movies.js";
import { NotFoundError } from "./errors.js";

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getMovies() {
  await wait(600);

  return movies;
}

async function getMovieById(movieId) {
  await wait(400);

  const movie = movies.find((movieItem) => {
    return movieItem.id === movieId;
  });

  if (!movie) {
    throw new NotFoundError("Film bulunamadı.");
  }

  return movie;
}

function parseIsoDateOnly(isoDateString) {
  const [year, month, day] = isoDateString
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

function toDateOnly(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function isMovieReleased(movie, referenceDate = new Date()) {
  if (!movie.releaseDate) {
    return true;
  }

  return (
    parseIsoDateOnly(movie.releaseDate) <=
    toDateOnly(referenceDate)
  );
}

function getDaysUntilRelease(movie, referenceDate = new Date()) {
  const releaseDay = parseIsoDateOnly(movie.releaseDate);
  const today = toDateOnly(referenceDate);

  const diffMs = releaseDay.getTime() - today.getTime();

  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

const movieService = {
  getMovies,
  getMovieById,
  isMovieReleased,
  getDaysUntilRelease,
  parseIsoDateOnly,
};

export default movieService;