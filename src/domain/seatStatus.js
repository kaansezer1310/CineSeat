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

const CLICK_SELECTABLE_STATUSES = Object.freeze([
  SEAT_STATUS.BOS,
  SEAT_STATUS.SECILI,
]);

export function isSeatSelectable(status) {
  return CLICK_SELECTABLE_STATUSES.includes(status);
}

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
