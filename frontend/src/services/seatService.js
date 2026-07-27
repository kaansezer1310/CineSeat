import {
  SEAT_STATUS,
} from "../domain/seatStatus.js";
import { ApiError, ConflictError } from "./errors.js";

// ---------------------------------------------------------------------------
// Mock/seed veri
// ---------------------------------------------------------------------------
// DOLU (ödemesi tamamlanmış) koltuklar — seans başına başlangıç durumu.
// localStorage'da hiç kayıt yoksa bu değerler kullanılır.
const initialReservedSeats = {
  101: ["A2", "A3", "B5", "C1", "D7"],
  102: ["A1", "A8", "B2", "B3", "C6"],
  103: ["A4", "B4", "C4", "D4", "E4"],

  201: ["A1", "A2", "B6", "C7", "D3", "E5"],
  202: ["A5", "B5", "C5", "D5", "E5"],
  203: ["A7", "B1", "C3", "D6"],

  301: ["A3", "A4", "B1", "C8"],
  302: ["A2", "B2", "C2", "D2"],
  303: ["A6", "B7", "C4", "E8"],

  401: ["A1", "A8", "B4", "C5"],
  402: ["A3", "B3", "C3", "D3"],
  403: ["A2", "A7", "B5", "D6"],
};

// GECICI_KILITLI (REQ-19 sayaç işleyen, geçici tutulan) koltuklar için
// başlangıç durumu. Şu an hiçbir akış otomatik olarak koltuk kilitlemiyor
// (1.4.7'nin kapsamı); burada yalnızca 101 seansında dört durumu bir arada
// gösterebilmek için küçük bir örnek veri tutuluyor.
const initialLockedSeats = {
  101: ["A5", "A6"],
};

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

// ---------------------------------------------------------------------------
// Güvenli storage erişimi
// ---------------------------------------------------------------------------
// localStorage hiçbir zaman güvenilir/yetkili veri olarak kabul edilmez;
// bozuk JSON, beklenmeyen şema veya eksik değer durumlarında sistemi asla
// çökertmeyecek şekilde okunur. `null` dönüşü "storage'da hiç kayıt yok"
// anlamına gelir (bu durumda mock başlangıç verisine düşülür); bozuk/şema
// dışı veri ise sessizce boş listeye (`[]`) normalize edilir — eski (mock)
// veriyi geri diriltmeyiz, çünkü storage anahtarı zaten "kullanılmış".
function readStoredSeatIdList(storageKey) {
  let rawValue;

  try {
    rawValue = localStorage.getItem(storageKey);
  } catch {
    return null;
  }

  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  let parsedValue;

  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    return [];
  }

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue.filter((seatId) => {
    return (
      typeof seatId === "string" && seatId.trim().length > 0
    );
  });
}

function writeSeatIdList(storageKey, seatIds) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify(seatIds)
    );
  } catch {
    // Hata yutulur
  }
}

function readStoredLockedSeatsMap(storageKey) {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) return {};
    const parsed = JSON.parse(rawValue);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredLockedSeatsMap(storageKey, map) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(map));
  } catch {
    // Hata yutulur
  }
}

function getDoluStorageKey(sessionId) {
  return `reserved-seats-${sessionId}`;
}

function getLockStorageKey(sessionId) {
  return `locked-seats-${sessionId}`;
}

// ---------------------------------------------------------------------------
// Girdi doğrulama
// ---------------------------------------------------------------------------
function normalizeSessionId(sessionId) {
  const numericSessionId = Number(sessionId);

  if (!Number.isFinite(numericSessionId)) {
    throw new ApiError("Geçersiz seans numarası.", {
      status: 400,
      code: "INVALID_SESSION_ID",
    });
  }

  return numericSessionId;
}

function normalizeSeatIdList(seats) {
  if (!Array.isArray(seats)) {
    throw new ApiError("Koltuk listesi geçersiz.", {
      status: 400,
      code: "INVALID_SEATS",
    });
  }

  const validSeatIds = seats.filter((seatId) => {
    return (
      typeof seatId === "string" && seatId.trim().length > 0
    );
  });

  if (validSeatIds.length === 0) {
    throw new ApiError("Koltuk listesi boş olamaz.", {
      status: 400,
      code: "EMPTY_SEATS",
    });
  }

  return [...new Set(validSeatIds)];
}

// ---------------------------------------------------------------------------
// Depolanan durumların okunması
// ---------------------------------------------------------------------------
async function getDoluSeatIds(sessionId) {
  const numericSessionId = normalizeSessionId(sessionId);

  await wait(400);

  const storedList = readStoredSeatIdList(
    getDoluStorageKey(numericSessionId)
  );

  if (storedList === null) {
    return [...(initialReservedSeats[numericSessionId] ?? [])];
  }

  return storedList;
}

async function getLockedSeatIds(sessionId) {
  const numericSessionId = normalizeSessionId(sessionId);

  await wait(400);

  const storedMap = readStoredLockedSeatsMap(
    getLockStorageKey(numericSessionId)
  );

  const seatIds = Object.keys(storedMap);
  if (seatIds.length === 0) {
    return [...(initialLockedSeats[numericSessionId] ?? [])];
  }

  return seatIds;
}

// Geriye dönük uyumluluk katmanı: `getReservedSeatsBySessionId`, mevcut
// `reservationService` ve daha önceki bileşenler tarafından "bu seanstaki
// dolu/alınmış koltuklar" anlamında kullanılıyordu. Dört durumlu modelde bu,
// tam olarak DOLU koltuklar kümesine karşılık gelir; imza ve dönüş şekli
// (string dizisi) değişmeden korunur.
async function getReservedSeatsBySessionId(sessionId) {
  return getDoluSeatIds(sessionId);
}

// Bir seanstaki her koltuğun *depolanan* (BOS dışındaki) durumunu döner:
// { [seatId]: "GECICI_KILITLI" | "DOLU" }. BOS koltuklar haritada yer almaz;
// bir seatId haritada yoksa BOS kabul edilir. SECILI bu haritada asla yer
// almaz — SECILI, kullanıcının yerel seçimiyle türetilen bir görüntüleme
// durumudur, servis tarafında kalıcı tutulmaz (bkz. `resolveDisplaySeatStatus`).
async function getSeatStatusesBySessionId(sessionId) {
  const numericSessionId = normalizeSessionId(sessionId);

  const [doluSeatIds, lockedSeatIds] = await Promise.all([
    getDoluSeatIds(numericSessionId),
    getLockedSeatIds(numericSessionId),
  ]);

  const statusesBySeatId = {};

  lockedSeatIds.forEach((seatId) => {
    statusesBySeatId[seatId] = SEAT_STATUS.GECICI_KILITLI;
  });

  // DOLU, GECICI_KILITLI ile aynı koltukta çakışırsa (normalde olmaması
  // gereken bir durum) DOLU üstün gelir — REQ-01'de DOLU nihai durumdur.
  doluSeatIds.forEach((seatId) => {
    statusesBySeatId[seatId] = SEAT_STATUS.DOLU;
  });

  return statusesBySeatId;
}

// ---------------------------------------------------------------------------
// Durum geçişleri (yazma işlemleri)
// ---------------------------------------------------------------------------
// GECICI_KILITLI oluşturur (SECILI/BOS -> GECICI_KILITLI). Şu anki booking
// akışı henüz bu fonksiyonu çağırmıyor (geri sayım/ödeme adımı 1.4.7/1.4.8
// kapsamındadır); fonksiyon, o görev üzerine inşa edilecek şekilde burada
// hazır tutulur ve zaten DOLU olan koltukları güvenle reddeder.
async function lockSeats({ sessionId, seats, lockToken }) {
  const numericSessionId = normalizeSessionId(sessionId);
  const normalizedSeatIds = normalizeSeatIdList(seats);

  if (!lockToken) {
    throw new ApiError("Kilit işlemi için token gereklidir.", { status: 400 });
  }

  await wait(300);

  const currentDoluSeatIds = await getDoluSeatIds(numericSessionId);
  const storedMap = readStoredLockedSeatsMap(getLockStorageKey(numericSessionId));

  const unavailableSeatIds = normalizedSeatIds.filter((seatId) => {
    // Eğer doluysa veya başka biri tarafından kilitliyse alınamaz
    const isDolu = currentDoluSeatIds.includes(seatId);
    const isLockedByOther = storedMap[seatId] && storedMap[seatId] !== lockToken;
    return isDolu || isLockedByOther;
  });

  if (unavailableSeatIds.length > 0) {
    throw new ConflictError(
      `${unavailableSeatIds.join(", ")} koltukları artık müsait değil.`
    );
  }

  // Token ile kilitle
  normalizedSeatIds.forEach((seatId) => {
    storedMap[seatId] = lockToken;
  });

  writeStoredLockedSeatsMap(
    getLockStorageKey(numericSessionId),
    storedMap
  );

  return Object.keys(storedMap);
}

// GECICI_KILITLI -> BOS geri dönüşü (REQ-19 zaman aşımı, REQ-12 kullanıcı
// iptali, REQ-13 sayaç bitimi). 1.4.7'deki sayaç, süre dolduğunda veya
// kullanıcı iptalinde bu fonksiyonu çağırarak koltukları serbest bırakır.
async function releaseLockedSeats({ sessionId, seats, lockToken }) {
  const numericSessionId = normalizeSessionId(sessionId);
  const normalizedSeatIds = normalizeSeatIdList(seats);

  await wait(200);

  const storedMap = readStoredLockedSeatsMap(getLockStorageKey(numericSessionId));

  let mapChanged = false;
  normalizedSeatIds.forEach((seatId) => {
    // Yalnızca kilit sahibi kilidi açabilir
    if (storedMap[seatId] && storedMap[seatId] === lockToken) {
      delete storedMap[seatId];
      mapChanged = true;
    }
  });

  if (mapChanged) {
    writeStoredLockedSeatsMap(getLockStorageKey(numericSessionId), storedMap);
  }

  return Object.keys(storedMap);
}

// GECICI_KILITLI (veya henüz kilitlenmemiş güncel akışta BOS) -> DOLU.
//
// NOT — bu fonksiyon artık üretim akışında kullanılmıyor (dead code, sadece
// `seatService.test.js`te test kapsamı var): gerçek rezervasyon akışı
// (`reservationService.createReservation`) atomiklik ve kilit-sahiplik
// (token) kontrolü için `reserveAllSeats`'i çağırıyor — Y3'te (Sprint 1
// review) bulunan "GECICI_KILITLI koltuklar için kilit sahibi kavramı yok"
// açığı orada `lockToken` parametresiyle kapatıldı (bkz. `lockSeats`,
// `releaseLockedSeats`, `reserveAllSeats`). Bu fonksiyon o kontrolü
// içermiyor; silinmedi çünkü hâlâ geçerli test kapsamı var, ama yeni kod
// bunu değil `reserveAllSeats`'i çağırmalı.
async function reserveSeats({ sessionId, seats }) {
  const numericSessionId = normalizeSessionId(sessionId);
  const normalizedSeatIds = normalizeSeatIdList(seats);

  await wait(500);

  const currentDoluSeatIds = await getDoluSeatIds(numericSessionId);

  const conflictingSeatIds = normalizedSeatIds.filter(
    (seatId) => {
      return currentDoluSeatIds.includes(seatId);
    }
  );

  if (conflictingSeatIds.length > 0) {
    throw new ConflictError(
      "Seçtiğin koltuklardan biri başka bir kullanıcı tarafından alınmış."
    );
  }

  const updatedDoluSeatIds = [
    ...new Set([
      ...currentDoluSeatIds,
      ...normalizedSeatIds,
    ]),
  ];

  // Bu koltuklar önceden kilitlenmişse (GECICI_KILITLI -> DOLU), kilit
  // kaydı temizlenir; kilitlenmemişse (güncel akışta olduğu gibi) bu no-op'tur.
  const lockedMap = readStoredLockedSeatsMap(getLockStorageKey(numericSessionId));
  normalizedSeatIds.forEach((seatId) => {
    delete lockedMap[seatId];
  });

  writeSeatIdList(
    getDoluStorageKey(numericSessionId),
    updatedDoluSeatIds
  );
  writeStoredLockedSeatsMap(
    getLockStorageKey(numericSessionId),
    lockedMap
  );

  return updatedDoluSeatIds;
}

async function reserveAllSeats(sessionSeatPairs, lockToken) {
  await wait(500);

  // Doğrulama aşaması (atomik kontrol)
  const currentStatusMap = new Map();
  
  for (const pair of sessionSeatPairs) {
    const numericSessionId = normalizeSessionId(pair.sessionId);
    const normalizedSeatIds = normalizeSeatIdList(pair.seats);
    
    const currentDoluSeatIds = await getDoluSeatIds(numericSessionId);
    const lockedMap = readStoredLockedSeatsMap(getLockStorageKey(numericSessionId));
    
    currentStatusMap.set(numericSessionId, { currentDoluSeatIds, normalizedSeatIds, lockedMap });

    const conflictingSeatIds = normalizedSeatIds.filter((seatId) => {
      const isDolu = currentDoluSeatIds.includes(seatId);
      const isLockedByOther = lockedMap[seatId] && lockedMap[seatId] !== lockToken;
      return isDolu || isLockedByOther;
    });
    
    if (conflictingSeatIds.length > 0) {
      throw new ConflictError(`${conflictingSeatIds.join(", ")} koltukları artık müsait değil.`);
    }
  }

  // Yazma aşaması (atomik yazım)
  for (const pair of sessionSeatPairs) {
    const numericSessionId = normalizeSessionId(pair.sessionId);
    const { currentDoluSeatIds, normalizedSeatIds, lockedMap } = currentStatusMap.get(numericSessionId);

    const updatedDoluSeatIds = [...new Set([...currentDoluSeatIds, ...normalizedSeatIds])];
    
    // Kilitleri temizle
    normalizedSeatIds.forEach((seatId) => {
      delete lockedMap[seatId];
    });

    writeSeatIdList(getDoluStorageKey(numericSessionId), updatedDoluSeatIds);
    writeStoredLockedSeatsMap(getLockStorageKey(numericSessionId), lockedMap);
  }
}

async function cancelReservedSeats({ sessionId, seats }) {
  const numericSessionId = normalizeSessionId(sessionId);
  const normalizedSeatIds = normalizeSeatIdList(seats);

  await wait(300);

  const currentDoluSeatIds = await getDoluSeatIds(
    numericSessionId
  );

  const updatedDoluSeatIds = currentDoluSeatIds.filter(
    (seatId) => {
      return !normalizedSeatIds.includes(seatId);
    }
  );

  writeSeatIdList(
    getDoluStorageKey(numericSessionId),
    updatedDoluSeatIds
  );

  return updatedDoluSeatIds;
}

const seatService = {
  getReservedSeatsBySessionId,
  getSeatStatusesBySessionId,
  lockSeats,
  releaseLockedSeats,
  reserveSeats,
  reserveAllSeats,
  cancelReservedSeats,
};

export default seatService;
