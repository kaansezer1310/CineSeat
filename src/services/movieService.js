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

// REQ-05 — vizyon süresi dolan (screeningEndDate'i geçmiş) filmler arşive
// düşer: ana sayfada gösterilmez ama veri silinmez, getMovieById ile hâlâ
// erişilebilir kalır. screeningEndDate günü dahil hâlâ vizyondadır (son
// gösterim günü); ancak sonraki gün arşive düşer. Alan hiç yoksa film süresiz
// vizyonda kabul edilir (isMovieReleased ile aynı güvenli varsayılan mantığı).
function isMovieArchived(movie, referenceDate = new Date()) {
  if (!movie.screeningEndDate) {
    return false;
  }

  return parseIsoDateOnly(movie.screeningEndDate) < toDateOnly(referenceDate);
}

// REQ-15 — "Yakında" sekmesi vizyon tarihi bugünden itibaren en fazla
// monthsAhead ay ileride olan filmlerle sınırlıdır. Veri movies.js'ten
// silinmez/gizlenmez (admin listesi vb. etkilenmez), sadece bu pencerenin
// dışındaki filmler ana sayfanın "Yakında" sekmesinde gösterilmez.
function isWithinComingSoonWindow(movie, referenceDate = new Date(), monthsAhead = 6) {
  if (!movie.releaseDate) {
    return true;
  }

  const releaseDay = parseIsoDateOnly(movie.releaseDate);
  const today = toDateOnly(referenceDate);
  const windowEnd = new Date(
    today.getFullYear(),
    today.getMonth() + monthsAhead,
    today.getDate()
  );

  return releaseDay <= windowEnd;
}

// REQ-08.1 — "Vizyonda" listesini vizyon tarihine veya kullanıcı puanına
// göre sırala. Varsayılan `date-desc` (yeniden eskiye). Orijinal diziyi
// mutasyona uğratmaz (yeni bir kopya döner).
function sortMovies(movieList, sortValue) {
  const sorted = [...movieList];

  const getReleaseTime = (movie) => {
    return movie.releaseDate
      ? parseIsoDateOnly(movie.releaseDate).getTime()
      : 0;
  };

  const getAverageRating = (movie) => movie.rating?.average ?? 0;

  switch (sortValue) {
    case "date-asc":
      sorted.sort((a, b) => getReleaseTime(a) - getReleaseTime(b));
      break;
    case "rating-desc":
      sorted.sort((a, b) => getAverageRating(b) - getAverageRating(a));
      break;
    case "rating-asc":
      sorted.sort((a, b) => getAverageRating(a) - getAverageRating(b));
      break;
    case "date-desc":
    default:
      sorted.sort((a, b) => getReleaseTime(b) - getReleaseTime(a));
  }

  return sorted;
}

// REQ-08.1 — tür ve izleyici (yaş) kısıtına göre filtrele. `"all"` ya da
// boş değer o kritere göre filtre uygulamaz.
function filterMovies(movieList, { genre = "all", ageRating = "all" } = {}) {
  return movieList.filter((movie) => {
    const matchesGenre = genre === "all" || movie.genre === genre;
    const matchesAgeRating =
      ageRating === "all" || movie.ageRating === ageRating;

    return matchesGenre && matchesAgeRating;
  });
}

function getAvailableGenres(movieList) {
  return Array.from(
    new Set(movieList.map((movie) => movie.genre))
  ).sort((a, b) => a.localeCompare(b, "tr-TR"));
}

function getAvailableAgeRatings(movieList) {
  return Array.from(
    new Set(movieList.map((movie) => movie.ageRating))
  ).sort((a, b) => a.localeCompare(b, "tr-TR"));
}

const movieService = {
  getMovies,
  getMovieById,
  addMovie,
  updateMovie,
  deleteMovie,
  isMovieReleased,
  getDaysUntilRelease,
  isMovieArchived,
  isWithinComingSoonWindow,
  sortMovies,
  filterMovies,
  getAvailableGenres,
  getAvailableAgeRatings,
  parseIsoDateOnly,
};

export default movieService;
