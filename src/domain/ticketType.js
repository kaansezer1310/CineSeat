// Tek doğruluk kaynağı — REQ-02 bilet tipleri.
// Depolanan değerler makine tarafından okunan sabitlerdir; Türkçe etiketler
// yalnızca arayüzde gösterilir. Fiyat çarpanları 1.4.5 kapsamındadır ve
// burada yer almaz.
export const TICKET_TYPE = Object.freeze({
  ADULT: "ADULT",
  STUDENT: "STUDENT",
  CHILD: "CHILD",
});

export const TICKET_TYPE_LIST = Object.freeze(
  Object.values(TICKET_TYPE)
);

// Belgelerde varsayılan tip belirtilmediği için sepete ekleme ve seçim
// akışını bozmamak adına en az şaşırtıcı varsayılan Yetişkin'dir.
export const DEFAULT_TICKET_TYPE = TICKET_TYPE.ADULT;

const TICKET_TYPE_LABELS = Object.freeze({
  [TICKET_TYPE.ADULT]: "Yetişkin",
  [TICKET_TYPE.STUDENT]: "Öğrenci",
  [TICKET_TYPE.CHILD]: "Çocuk",
});

export function isValidTicketType(value) {
  return (
    typeof value === "string" &&
    TICKET_TYPE_LIST.includes(value)
  );
}

export function getTicketTypeLabel(ticketType) {
  return (
    TICKET_TYPE_LABELS[ticketType] ??
    TICKET_TYPE_LABELS[DEFAULT_TICKET_TYPE]
  );
}

export function normalizeTicketType(value) {
  return isValidTicketType(value)
    ? value
    : null;
}
