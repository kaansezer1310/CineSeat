import movies from "../data/movies.js";
import { NotFoundError } from "./errors.js";

let mutableMovies = [...movies];

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getMovies() {
  await wait(600);
  return mutableMovies;
}

async function getMovieById(movieId) {
  await wait(400);

  const movie = mutableMovies.find((movieItem) => {
    return movieItem.id === Number(movieId);
  });

  if (!movie) {
    throw new NotFoundError("Film bulunamadı.");
  }

  return movie;
}

async function addMovie(movieData) {
  await wait(500);
  const newMovie = {
    ...movieData,
    id: Date.now(),
  };
  mutableMovies.push(newMovie);
  return newMovie;
}

async function updateMovie(movieId, movieData) {
  await wait(500);
  const index = mutableMovies.findIndex((m) => m.id === Number(movieId));
  if (index === -1) throw new NotFoundError("Film bulunamadı.");

  mutableMovies[index] = { ...mutableMovies[index], ...movieData };
  return mutableMovies[index];
}

async function deleteMovie(movieId) {
  await wait(500);
  const index = mutableMovies.findIndex((m) => m.id === Number(movieId));
  if (index === -1) throw new NotFoundError("Film bulunamadı.");

  mutableMovies = mutableMovies.filter((m) => m.id !== Number(movieId));
  return true;
}

function parseIsoDateOnly(isoDateString) {
  const [year, month, day] = isoDateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isMovieReleased(movie, referenceDate = new Date()) {
  if (!movie.releaseDate) {
    return true;
  }

  return parseIsoDateOnly(movie.releaseDate) <= toDateOnly(referenceDate);
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
  addMovie,
  updateMovie,
  deleteMovie,
  isMovieReleased,
  getDaysUntilRelease,
  parseIsoDateOnly,
};

export default movieService;
