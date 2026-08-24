import apiClient from "./apiClient.js";

// Backend `ShowtimeDto` döner:
//   { id, movieId, hallId, startDatetime, basePrice, format,
//     hallName, cinemaName, totalSeats }
//
// Arayüz seansı "13 Temmuz · 13:30 · Salon 1" biçiminde gösteriyor; ham ISO
// tarihi ekrana basılamaz. Bu yüzden burada hem görüntüleme alanları
// (`date`/`time`) hem de karşılaştırma için ham `startDatetime` birlikte
// taşınır — mevcut ekranlar ve sepet öğeleri alan adlarını değiştirmeden
// çalışmaya devam eder.
const DATE_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
});

function mapShowtimeDto(dto) {
  const startsAt = new Date(dto.startDatetime);
  const isValidDate = !Number.isNaN(startsAt.getTime());

  return {
    id: dto.id,
    movieId: dto.movieId,
    hallId: dto.hallId,
    startDatetime: dto.startDatetime,
    date: isValidDate ? DATE_FORMATTER.format(startsAt) : "",
    time: isValidDate ? TIME_FORMATTER.format(startsAt) : "",
    hallName: dto.hallName ?? "",
    cinemaName: dto.cinemaName ?? "",
    price: Number(dto.basePrice) || 0,
    totalSeats: dto.totalSeats ?? 0,
    format: dto.format ?? null,
  };
}

async function getSessionsByMovieId(movieId, { pageSize = 50 } = {}) {
  const result = await apiClient.get(
    `/showtimes/by-movie/${movieId}?pageNumber=1&pageSize=${pageSize}`
  );

  return (result?.items ?? []).map(mapShowtimeDto);
}

async function getSessionById(sessionId) {
  const dto = await apiClient.get(`/showtimes/${sessionId}`);
  return mapShowtimeDto(dto);
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

// Görüntüleme metni ("13 Temmuz" + "13:30") yıl içermez. Sepete daha önce
// eklenmiş ya da geçmiş rezervasyonlardan gelen öğelerde yalnızca bu metinler
// bulunabilir; o durumda referans tarihin yılı varsayılır.
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

// ISO tarih varsa yıl tahmini yapmaya gerek yok — bu yol her zaman tercih
// edilmeli; `hasSessionPassed` yalnızca eski/eksik veri için geri düşüştür.
function isShowtimeInPast(item, referenceDate = new Date()) {
  if (item?.startDatetime) {
    const startsAt = new Date(item.startDatetime);
    if (!Number.isNaN(startsAt.getTime())) {
      return startsAt < referenceDate;
    }
  }

  return hasSessionPassed(item?.date, item?.time, referenceDate);
}

const sessionService = {
  getSessionsByMovieId,
  getSessionById,
  parseSessionDateTime,
  hasSessionPassed,
  isShowtimeInPast,
};

export default sessionService;
