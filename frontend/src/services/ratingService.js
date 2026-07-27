import movies from "../data/movies.js";

const RATINGS_STORAGE_KEY = "cineseat-ratings";

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

// { [movieId]: { [userId]: stars } } — kullanıcı başına en fazla 1 puan,
// tekrar puanlama önceki değerin üzerine yazar (güncelleme).
function getStoredRatings() {
  const saved = localStorage.getItem(RATINGS_STORAGE_KEY);

  if (!saved) {
    return {};
  }

  try {
    const parsed = JSON.parse(saved);

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function getSeedRating(movieId) {
  const movie = movies.find((movieItem) => {
    return movieItem.id === Number(movieId);
  });

  return movie?.rating ?? { average: 0, count: 0 };
}

// Görüntülenen ortalama = tohum (seed) ortalaması + kullanıcı puanlarının
// üzerine eklenmesiyle hesaplanan ağırlıklı ortalama. Gerçek bir backend
// olmadığı için tohum verisi "geçmiş puanlar" gibi davranır; kullanıcı
// puanları bunun üzerine eklenir, hiçbir zaman geçmiş veri silinmez.
function calculateDisplayRating(movieId, userRatingsForMovie) {
  const seed = getSeedRating(movieId);
  const userStarsList = Object.values(userRatingsForMovie);

  const totalCount = seed.count + userStarsList.length;

  if (totalCount === 0) {
    return { average: 0, count: 0 };
  }

  const seedSum = seed.average * seed.count;
  const userSum = userStarsList.reduce((sum, stars) => sum + stars, 0);

  const average = (seedSum + userSum) / totalCount;

  return {
    average: Math.round(average * 10) / 10,
    count: totalCount,
  };
}

async function getMovieRating(movieId) {
  await wait(200);

  const allRatings = getStoredRatings();
  const userRatingsForMovie = allRatings[movieId] ?? {};

  return calculateDisplayRating(movieId, userRatingsForMovie);
}

async function getUserRating(movieId, userId) {
  await wait(150);

  const allRatings = getStoredRatings();

  return allRatings[movieId]?.[userId] ?? null;
}

async function submitRating(movieId, userId, stars) {
  await wait(300);

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new Error("Puan 1 ile 5 arasında bir tam sayı olmalıdır.");
  }

  const allRatings = getStoredRatings();
  const userRatingsForMovie = { ...(allRatings[movieId] ?? {}) };

  userRatingsForMovie[userId] = stars;

  const updatedRatings = {
    ...allRatings,
    [movieId]: userRatingsForMovie,
  };

  localStorage.setItem(
    RATINGS_STORAGE_KEY,
    JSON.stringify(updatedRatings)
  );

  return calculateDisplayRating(movieId, userRatingsForMovie);
}

const ratingService = {
  getMovieRating,
  getUserRating,
  submitRating,
};

export default ratingService;
