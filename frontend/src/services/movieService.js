import apiClient from "./apiClient.js";
import { NotFoundError } from "./errors.js";

// ---------------------------------------------------------------------------
// Backend <-> frontend uyarlaması
// ---------------------------------------------------------------------------
// Backend'in MovieDto'su (Id, Title, Duration, Description, AgeLimit,
// Language, Poster, StartDate, EndDate, AvgScore) ile frontend'in beklediği
// film şekli (genre, ageRating, releaseYear, releaseDate, rating.average...)
// birebir aynı değil. Bu fonksiyonlar aradaki dönüşümü tek yerde yapar —
// HomePage/MovieDetailsPage/AdminMovieForm hiç değişmeden çalışmaya devam eder.

const AGE_RATING_TO_LIMIT = {
  "Genel İzleyici": 0,
  "7+": 7,
  "13+": 13,
  "16+": 16,
  "18+": 18,
};

function ageRatingToAgeLimit(ageRating) {
  return AGE_RATING_TO_LIMIT[ageRating] ?? 0;
}

function ageLimitToAgeRating(ageLimit) {
  if (ageLimit >= 18) return "18+";
  if (ageLimit >= 16) return "16+";
  if (ageLimit >= 13) return "13+";
  if (ageLimit >= 7) return "7+";
  return "Genel İzleyici";
}

function toDateOnlyString(isoDateTime) {
  return typeof isoDateTime === "string" ? isoDateTime.slice(0, 10) : "";
}

// NOT (bilinçli sınırlama): Backend'in MovieDto'sunda tür (genre) bilgisi
// YOK — bir filmin türleri ayrı bir uç noktadan (`GET /movies/{id}/genres`)
// geliyor ve tekil bir string değil, LİSTE (bir film birden fazla türe sahip
// olabilir). Film listesinde (getMovies) her film için ayrı bir tür isteği
// atmak (N+1) performans açısından mantıksız olacağından, listede `genre`
// boş bırakılıyor — bu yüzden ana sayfadaki tür filtresi şu an gerçek veriyle
// çalışmıyor. Film detayında (getMovieById) tek bir ek istekle gerçek
// türler çekiliyor. Kalıcı çözüm: backend'in MovieDto'suna türleri de
// eklemesi (ayrı bir görev/karar).
function mapMovieDto(dto, { genres = [] } = {}) {
  const releaseDate = toDateOnlyString(dto.startDate);

  return {
    id: dto.id,
    title: dto.title,
    genre: genres.length > 0 ? genres.join(", ") : "",
    duration: dto.duration,
    ageRating: ageLimitToAgeRating(dto.ageLimit),
    releaseYear: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
    releaseDate,
    screeningEndDate: toDateOnlyString(dto.endDate) || null,
    poster: dto.poster,
    description: dto.description,
    rating: { average: Number(dto.avgScore) || 0, count: 0 },
    fragmanYoutubeId: null,
    language: dto.language,
  };
}

function toIsoStartOfDay(dateOnlyString) {
  return `${dateOnlyString}T00:00:00.000Z`;
}

function buildMovieCommandBody(movieData) {
  // Form yalnızca vizyon (başlangıç) tarihini topluyor; backend başlangıç VE
  // bitiş tarihi ister (bitiş > başlangıç). Form'da ayrı bir alan yoksa
  // makul bir varsayılan (başlangıçtan 90 gün sonra) uygulanır.
  const startDate = movieData.releaseDate;
  const endDate =
    movieData.screeningEndDate ||
    (startDate
      ? new Date(
          new Date(startDate).getTime() + 90 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .slice(0, 10)
      : startDate);

  return {
    title: movieData.title,
    duration: Number(movieData.duration),
    description: movieData.description,
    ageLimit: ageRatingToAgeLimit(movieData.ageRating),
    language: movieData.language || "TR",
    poster: movieData.poster,
    startDate: toIsoStartOfDay(startDate),
    endDate: toIsoStartOfDay(endDate),
  };
}

// Tür adını (form'daki serbest metin) var olan bir Genre'ye eşlemeye çalışır.
// NOT (bilinçli sınırlama): eşleşme bulunamazsa yeni bir tür OTOMATİK
// OLUŞTURULMAZ — bu, kullanıcının fark etmeden veri modeline yeni kayıt
// eklemesi anlamına gelirdi. Bulunamazsa atama sessizce atlanır; film yine
// de kaydedilir, sadece türsüz kalır.
async function tryAssignGenreByName(movieId, genreName) {
  const trimmed = (genreName || "").trim();
  if (!trimmed) return;

  const genres = await apiClient.get("/genres");
  const match = genres.find(
    (g) => g.name.localeCompare(trimmed, "tr-TR", { sensitivity: "base" }) === 0
  );

  if (match) {
    await apiClient.post(`/movies/${movieId}/genres`, { genreId: match.id });
  }
}

// ---------------------------------------------------------------------------
// Servis
// ---------------------------------------------------------------------------

async function getMovies() {
  const result = await apiClient.get("/movies?page=1&pageSize=100");
  return result.items.map((dto) => mapMovieDto(dto));
}

async function getMovieById(movieId) {
  const [dto, genres] = await Promise.all([
    apiClient.get(`/movies/${movieId}`).catch((err) => {
      if (err.status === 404) throw new NotFoundError("Film bulunamadı.");
      throw err;
    }),
    apiClient
      .get(`/movies/${movieId}/genres`)
      .then((list) => list.map((g) => g.name))
      .catch(() => []),
  ]);

  return mapMovieDto(dto, { genres });
}

async function addMovie(movieData) {
  const id = await apiClient.post("/movies", buildMovieCommandBody(movieData));
  await tryAssignGenreByName(id, movieData.genre);
  return getMovieById(id);
}

async function updateMovie(movieId, movieData) {
  await apiClient.put(`/movies/${movieId}`, {
    id: Number(movieId),
    ...buildMovieCommandBody(movieData),
  });
  await tryAssignGenreByName(movieId, movieData.genre);
  return getMovieById(movieId);
}

async function deleteMovie(movieId) {
  await apiClient.del(`/movies/${movieId}`);
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
    new Set(movieList.map((movie) => movie.genre).filter(Boolean))
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
