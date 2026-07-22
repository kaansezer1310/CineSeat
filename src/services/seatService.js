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
    // localStorage yazımı (kota/gizli mod vb. nedenlerle) başarısız
    // olsa bile bu bir mock/prototip katmanıdır; akışı çökertmemek için
    // hata yutulur. Gerçek kalıcılık Faz-2 backend'inin sorumluluğudur.
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

  const storedList = readStoredSeatIdList(
    getLockStorageKey(numericSessionId)
  );

  if (storedList === null) {
    return [...(initialLockedSeats[numericSessionId] ?? [])];
  }

  return storedList;
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
async function lockSeats({ sessionId, seats }) {
  const numericSessionId = normalizeSessionId(sessionId);
  const normalizedSeatIds = normalizeSeatIdList(seats);

  await wait(300);

  const [currentDoluSeatIds, currentLockedSeatIds] =
    await Promise.all([
      getDoluSeatIds(numericSessionId),
      getLockedSeatIds(numericSessionId),
    ]);

  const unavailableSeatIds = normalizedSeatIds.filter(
    (seatId) => {
      return currentDoluSeatIds.includes(seatId);
    }
  );

  if (unavailableSeatIds.length > 0) {
    throw new ConflictError(
      `${unavailableSeatIds.join(", ")} koltukları artık müsait değil.`
    );
  }

  const updatedLockedSeatIds = [
    ...new Set([
      ...currentLockedSeatIds,
      ...normalizedSeatIds,
    ]),
  ];

  writeSeatIdList(
    getLockStorageKey(numericSessionId),
    updatedLockedSeatIds
  );

  return updatedLockedSeatIds;
}

// GECICI_KILITLI -> BOS geri dönüşü (REQ-19 zaman aşımı, REQ-12 kullanıcı
// iptali, REQ-13 sayaç bitimi). 1.4.7'deki sayaç, süre dolduğunda veya
// kullanıcı iptalinde bu fonksiyonu çağırarak koltukları serbest bırakır.
async function releaseLockedSeats({ sessionId, seats }) {
  const numericSessionId = normalizeSessionId(sessionId);
  const normalizedSeatIds = normalizeSeatIdList(seats);

  await wait(200);

  const currentLockedSeatIds = await getLockedSeatIds(
    numericSessionId
  );

  const updatedLockedSeatIds = currentLockedSeatIds.filter(
    (seatId) => {
      return !normalizedSeatIds.includes(seatId);
    }
  );

  writeSeatIdList(
    getLockStorageKey(numericSessionId),
    updatedLockedSeatIds
  );

  return updatedLockedSeatIds;
}

// GECICI_KILITLI (veya henüz kilitlenmemiş güncel akışta BOS) -> DOLU.
// Rezervasyon akışının koltukları nihai olarak DOLU'ya taşıdığı sınırdır;
// `reservationService`, çakışma tespiti sonrası bunu her sepet öğesi için
// çağırır. Zaten DOLU olan bir koltuk asla tekrar rezerve edilemez —
// arayüz kontrolü atlatılsa bile bu koruma serviste kalır.
async function reserveSeats({ sessionId, seats }) {
  const numericSessionId = normalizeSessionId(sessionId);
  const normalizedSeatIds = normalizeSeatIdList(seats);

  await wait(500);

  const [currentDoluSeatIds, currentLockedSeatIds] =
    await Promise.all([
      getDoluSeatIds(numericSessionId),
      getLockedSeatIds(numericSessionId),
    ]);

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
  const updatedLockedSeatIds = currentLockedSeatIds.filter(
    (seatId) => {
      return !normalizedSeatIds.includes(seatId);
    }
  );

  writeSeatIdList(
    getDoluStorageKey(numericSessionId),
    updatedDoluSeatIds
  );
  writeSeatIdList(
    getLockStorageKey(numericSessionId),
    updatedLockedSeatIds
  );

  return updatedDoluSeatIds;
}

async function reserveAllSeats(sessionSeatPairs) {
  await wait(500);

  // Doğrulama aşaması (atomik kontrol)
  const currentStatusMap = new Map();
  
  for (const pair of sessionSeatPairs) {
    const numericSessionId = normalizeSessionId(pair.sessionId);
    const normalizedSeatIds = normalizeSeatIdList(pair.seats);
    
    const currentDoluSeatIds = await getDoluSeatIds(numericSessionId);
    currentStatusMap.set(numericSessionId, { currentDoluSeatIds, normalizedSeatIds });

    const conflictingSeatIds = normalizedSeatIds.filter((seatId) => currentDoluSeatIds.includes(seatId));
    
    if (conflictingSeatIds.length > 0) {
      throw new ConflictError(`${conflictingSeatIds.join(", ")} koltukları artık müsait değil.`);
    }
  }

  // Yazma aşaması (atomik yazım)
  for (const pair of sessionSeatPairs) {
    const numericSessionId = normalizeSessionId(pair.sessionId);
    const { currentDoluSeatIds, normalizedSeatIds } = currentStatusMap.get(numericSessionId);
    
    const currentLockedSeatIds = await getLockedSeatIds(numericSessionId);

    const updatedDoluSeatIds = [...new Set([...currentDoluSeatIds, ...normalizedSeatIds])];
    const updatedLockedSeatIds = currentLockedSeatIds.filter((seatId) => !normalizedSeatIds.includes(seatId));

    writeSeatIdList(getDoluStorageKey(numericSessionId), updatedDoluSeatIds);
    writeSeatIdList(getLockStorageKey(numericSessionId), updatedLockedSeatIds);
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
