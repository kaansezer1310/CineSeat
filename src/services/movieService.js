import movies from "../data/movies.js";

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
    throw new Error("Film bulunamadı.");
  }

  return movie;
}

const movieService = {
  getMovies,
  getMovieById,
};

export default movieService;