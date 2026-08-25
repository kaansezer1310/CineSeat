import { describe, expect, it } from "vitest";

import { TICKET_TYPE } from "../domain/ticketType.js";
import { calcItemTotal, calcSubtotal, formatPrice } from "./pricing.js";

/**
 * Bilet tipi çarpanlarının BAĞLAYICI değeri backend'de:
 * CreateReservationCommandHandler.TicketTypeMultiplier
 *
 * Buradaki kopya yalnızca ön izleme için var. İkisi ayrışırsa kullanıcı bir
 * fiyat görüp başka tutar öder — çocuk bileti bir süre 0.60'a gösterilip
 * 0.50'ye tahsil edildi. Bu testler o çarpanları sabitliyor.
 */
const UNIT = 200;

function item(...ticketTypes) {
  return {
    unitPrice: UNIT,
    seats: ticketTypes.map((ticketType, index) => ({
      seatId: index + 1,
      ticketType,
    })),
  };
}

describe("bilet tipi çarpanları backend ile aynı", () => {
  it("yetişkin tam fiyat", () => {
    expect(calcItemTotal(item(TICKET_TYPE.ADULT))).toBe(200);
  });

  it("öğrenci %75", () => {
    expect(calcItemTotal(item(TICKET_TYPE.STUDENT))).toBe(150);
  });

  it("çocuk %50", () => {
    // Backend 0.50 uyguluyor; on yuz bir sure 0.60 gosteriyordu.
    expect(calcItemTotal(item(TICKET_TYPE.CHILD))).toBe(100);
  });

  it("karışık seçimde tipleri ayrı ayrı çarpar", () => {
    expect(
      calcItemTotal(
        item(TICKET_TYPE.ADULT, TICKET_TYPE.STUDENT, TICKET_TYPE.CHILD)
      )
    ).toBe(450);
  });

  it("bilinmeyen tipte tam fiyata düşer", () => {
    expect(calcItemTotal(item("BILINMEYEN"))).toBe(200);
  });
});

describe("calcItemTotal savunmacı davranış", () => {
  it("koltuk yoksa sıfır", () => {
    expect(calcItemTotal(item())).toBe(0);
  });

  it("geçersiz girdide sıfır", () => {
    expect(calcItemTotal(null)).toBe(0);
    expect(calcItemTotal({})).toBe(0);
    expect(calcItemTotal({ unitPrice: 100 })).toBe(0);
  });
});

describe("calcSubtotal", () => {
  it("kalemleri toplar", () => {
    expect(
      calcSubtotal([item(TICKET_TYPE.ADULT), item(TICKET_TYPE.CHILD)])
    ).toBe(300);
  });

  it("boş sepette sıfır", () => {
    expect(calcSubtotal([])).toBe(0);
  });

  it("geçersiz girdide sıfır", () => {
    expect(calcSubtotal(null)).toBe(0);
  });
});

describe("formatPrice", () => {
  it("tr-TR biçiminde iki ondalık verir", () => {
    expect(formatPrice(495)).toBe("495,00");
    expect(formatPrice(1234.5)).toBe("1.234,50");
  });
});
