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
  const index = mutableMovies.findIndex(m => m.id === Number(movieId));
  if (index === -1) throw new NotFoundError("Film bulunamadı.");
  
  mutableMovies[index] = { ...mutableMovies[index], ...movieData };
  return mutableMovies[index];
}

async function deleteMovie(movieId) {
  await wait(500);
  const index = mutableMovies.findIndex(m => m.id === Number(movieId));
  if (index === -1) throw new NotFoundError("Film bulunamadı.");
  
  mutableMovies = mutableMovies.filter(m => m.id !== Number(movieId));
  return true;
}

const movieService = {
  getMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
};

export default movieService;