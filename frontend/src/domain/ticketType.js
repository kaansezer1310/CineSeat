export const TICKET_TYPE = Object.freeze({
  ADULT: "ADULT",
  STUDENT: "STUDENT",
  CHILD: "CHILD",
});

export const TICKET_TYPE_LIST = Object.freeze(
  Object.values(TICKET_TYPE)
);

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

// Backend enum'u PascalCase ad olarak taşıyor (JsonStringEnumConverter):
// TicketType { Adult, Student, Child }. Arayüz kendi büyük harfli
// sabitlerini kullanmaya devam eder; çeviri tek yerde, burada yapılır.
const API_TICKET_TYPES = Object.freeze({
  [TICKET_TYPE.ADULT]: "Adult",
  [TICKET_TYPE.STUDENT]: "Student",
  [TICKET_TYPE.CHILD]: "Child",
});

export function toApiTicketType(value) {
  return (
    API_TICKET_TYPES[value] ?? API_TICKET_TYPES[DEFAULT_TICKET_TYPE]
  );
}

export function fromApiTicketType(value) {
  const match = Object.entries(API_TICKET_TYPES).find(
    ([, apiValue]) => apiValue === value
  );

  return match ? match[0] : DEFAULT_TICKET_TYPE;
}
