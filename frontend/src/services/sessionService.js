import sessions from "../data/sessions.js";
import { NotFoundError } from "./errors.js";

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getSessionsByMovieId(movieId) {
  await wait(500);

  return sessions.filter((session) => {
    return session.movieId === movieId;
  });
}

async function getSessionById(sessionId) {
  await wait(400);

  const session = sessions.find((sessionItem) => {
    return sessionItem.id === sessionId;
  });

  if (!session) {
    throw new NotFoundError("Seans bulunamadı.");
  }

  return session;
}

const TURKISH_MONTHS = {
  ocak: 0,
  şubat: 1,
  subat: 1,
  mart: 2,
  nisan: 3,
  mayıs: 4,
  mayis: 4,
  haziran: 5,
  temmuz: 6,
  ağustos: 7,
  agustos: 7,
  eylül: 8,
  eylul: 8,
  ekim: 9,
  kasım: 10,
  kasim: 10,
  aralık: 11,
  aralik: 11,
};

// Seans verisindeki `date` alanı yıl içermeyen bir görüntüleme metni
// ("13 Temmuz") — REQ-18'in "gösterim saati geçmiş/geçmemiş" ayrımını doğru
// yapabilmek için `time` ile birlikte gerçek bir Date'e çevrilmesi gerekir.
// Yıl bilgisi olmadığından referans tarihin yılı varsayılır (mock veri
// zaten tek bir takvim yılı içinde kurgulanmış — bkz. movies.js releaseDate).
function parseSessionDateTime(dateText, timeText, referenceDate = new Date()) {
  if (!dateText || !timeText) {
    return null;
  }

  const [dayText, monthText] = dateText.trim().split(/\s+/);
  const day = Number(dayText);
  const month = TURKISH_MONTHS[monthText?.toLocaleLowerCase("tr-TR")];

  const [hourText, minuteText] = timeText.trim().split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    !Number.isInteger(day) ||
    month === undefined ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    return null;
  }

  return new Date(
    referenceDate.getFullYear(),
    month,
    day,
    hour,
    minute
  );
}

// Bir seansın gösterim saati geçmiş mi? Tarih parse edilemezse (bozuk/eksik
// veri) güvenli varsayılan olarak "geçmemiş" kabul edilir — bir bileti
// hatalı şekilde geçmişe düşürüp gizlemektense güncel listede göstermek
// tercih edildi.
function hasSessionPassed(dateText, timeText, referenceDate = new Date()) {
  const sessionDateTime = parseSessionDateTime(
    dateText,
    timeText,
    referenceDate
  );

  if (!sessionDateTime) {
    return false;
  }

  return sessionDateTime < referenceDate;
}

const sessionService = {
  getSessionsByMovieId,
  getSessionById,
  parseSessionDateTime,
  hasSessionPassed,
};

export default sessionService;