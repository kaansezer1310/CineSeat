// Tek doğruluk kaynağı (single source of truth) — REQ-01 koltuk durum makinesi.
// Koltuk durumu bir seansa aittir (filme değil) ve tam olarak şu dört
// değerden birini alır. Değerler REQ-01'de tanımlı makine tarafından
// okunan sabitlerdir; çevrilmez veya başka string'lerle değiştirilmez.
export const SEAT_STATUS = Object.freeze({
  BOS: "BOS",
  SECILI: "SECILI",
  GECICI_KILITLI: "GECICI_KILITLI",
  DOLU: "DOLU",
});

export const SEAT_STATUS_LIST = Object.freeze(
  Object.values(SEAT_STATUS)
);

export function isValidSeatStatus(value) {
  return (
    typeof value === "string" &&
    SEAT_STATUS_LIST.includes(value)
  );
}

// REQ-01 — İzin verilen geçiş tablosu.
// İleri akış: BOS -> SECILI -> GECICI_KILITLI -> DOLU
// Geri dönüşler yalnızca REQ-01'de belirtilen hâllerde:
//   SECILI -> BOS         : kullanıcı henüz onaylanmamış seçimini kaldırır
//   GECICI_KILITLI -> BOS : REQ-19 (zaman aşımı), REQ-12 (kullanıcı iptali),
//                           REQ-13 (sayaç bitimi)
//   DOLU -> BOS           : rezervasyon iptali
// Bu tablo dışındaki hiçbir geçişe izin verilmez.
const ALLOWED_TRANSITIONS = Object.freeze({
  [SEAT_STATUS.BOS]: Object.freeze([SEAT_STATUS.SECILI]),
  [SEAT_STATUS.SECILI]: Object.freeze([
    SEAT_STATUS.BOS,
    SEAT_STATUS.GECICI_KILITLI,
  ]),
  [SEAT_STATUS.GECICI_KILITLI]: Object.freeze([
    SEAT_STATUS.DOLU,
    SEAT_STATUS.BOS,
  ]),
  [SEAT_STATUS.DOLU]: Object.freeze([SEAT_STATUS.BOS]),
});

export function canTransitionSeatStatus(fromStatus, toStatus) {
  if (
    !isValidSeatStatus(fromStatus) ||
    !isValidSeatStatus(toStatus)
  ) {
    return false;
  }

  return ALLOWED_TRANSITIONS[fromStatus].includes(toStatus);
}

// Kullanıcının koltuk üzerine doğrudan tıklayarak seçim/seçim kaldırma
// yapabildiği durumlar. GECICI_KILITLI ve DOLU, REQ-01 uyarınca "hiçbir
// akış tarafından seçilemez"; bu durumlardan BOS'a dönüş (zaman aşımı,
// iptal, rezervasyon iptali) kullanıcı tıklamasıyla değil sistem/servis
// tarafında tetiklenen bir geçiştir — bu yüzden burada kasıtlı olarak
// ALLOWED_TRANSITIONS'tan türetilmez, açıkça listelenir.
const CLICK_SELECTABLE_STATUSES = Object.freeze([
  SEAT_STATUS.BOS,
  SEAT_STATUS.SECILI,
]);

export function isSeatSelectable(status) {
  return CLICK_SELECTABLE_STATUSES.includes(status);
}

// Bir koltuğun ekranda hangi durumda gösterileceğini hesaplar.
// Kurallar (bkz. görev tanımı §5):
//  - DOLU veya GECICI_KILITLI hiçbir zaman SECILI olarak gösterilmez;
//    servisten gelen "kullanılamaz" bilgisi her zaman önceliklidir.
//  - Yerel kullanıcı seçimi yalnızca BOS bir koltuğu SECILI yapabilir.
//  - Geçersiz/bilinmeyen bir stored status güvenli şekilde BOS'a düşer.
export function resolveDisplaySeatStatus(
  storedStatus,
  isSelectedLocally
) {
  const safeStoredStatus = isValidSeatStatus(storedStatus)
    ? storedStatus
    : SEAT_STATUS.BOS;

  if (safeStoredStatus !== SEAT_STATUS.BOS) {
    return safeStoredStatus;
  }

  return isSelectedLocally
    ? SEAT_STATUS.SECILI
    : SEAT_STATUS.BOS;
}

const SEAT_STATUS_LABELS = Object.freeze({
  [SEAT_STATUS.BOS]: "Boş",
  [SEAT_STATUS.SECILI]: "Seçili",
  [SEAT_STATUS.GECICI_KILITLI]: "Geçici kilitli",
  [SEAT_STATUS.DOLU]: "Dolu",
});

export function getSeatStatusLabel(status) {
  return (
    SEAT_STATUS_LABELS[status] ??
    SEAT_STATUS_LABELS[SEAT_STATUS.BOS]
  );
}
