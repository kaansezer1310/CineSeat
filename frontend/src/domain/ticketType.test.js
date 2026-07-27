import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_TICKET_TYPE,
  TICKET_TYPE,
  TICKET_TYPE_LIST,
  getTicketTypeLabel,
  isValidTicketType,
  normalizeTicketType,
} from "./ticketType.js";

describe("ticketType", () => {
  it("Yetişkin, Öğrenci ve Çocuk için sabit makine değerleri tanımlar", () => {
    expect(TICKET_TYPE.ADULT).toBe("ADULT");
    expect(TICKET_TYPE.STUDENT).toBe("STUDENT");
    expect(TICKET_TYPE.CHILD).toBe("CHILD");
    expect(TICKET_TYPE_LIST).toEqual([
      "ADULT",
      "STUDENT",
      "CHILD",
    ]);
  });

  it("varsayılan bilet tipi Yetişkin'dir", () => {
    expect(DEFAULT_TICKET_TYPE).toBe(TICKET_TYPE.ADULT);
  });

  it("geçerli ve geçersiz bilet tiplerini ayırır", () => {
    expect(isValidTicketType(TICKET_TYPE.ADULT)).toBe(true);
    expect(isValidTicketType(TICKET_TYPE.STUDENT)).toBe(
      true
    );
    expect(isValidTicketType(TICKET_TYPE.CHILD)).toBe(true);
    expect(isValidTicketType("Yetişkin")).toBe(false);
    expect(isValidTicketType("")).toBe(false);
    expect(isValidTicketType(null)).toBe(false);
    expect(isValidTicketType(undefined)).toBe(false);
  });

  it("Türkçe etiketleri makine değerlerinden ayırır", () => {
    expect(getTicketTypeLabel(TICKET_TYPE.ADULT)).toBe(
      "Yetişkin"
    );
    expect(getTicketTypeLabel(TICKET_TYPE.STUDENT)).toBe(
      "Öğrenci"
    );
    expect(getTicketTypeLabel(TICKET_TYPE.CHILD)).toBe(
      "Çocuk"
    );
  });

  it("normalizeTicketType yalnızca geçerli değerleri geçirir", () => {
    expect(normalizeTicketType(TICKET_TYPE.STUDENT)).toBe(
      TICKET_TYPE.STUDENT
    );
    expect(normalizeTicketType("CHILD")).toBe(
      TICKET_TYPE.CHILD
    );
    expect(normalizeTicketType("invalid")).toBeNull();
    expect(normalizeTicketType(undefined)).toBeNull();
  });
});
