import { describe, expect, it } from "vitest";

import sessionService from "./sessionService.js";

describe("sessionService.parseSessionDateTime", () => {
  it("Türkçe ay adını ve saati referans yılıyla birleştirip Date döner", () => {
    const parsed = sessionService.parseSessionDateTime(
      "13 Temmuz",
      "13:30",
      new Date(2026, 0, 1)
    );

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(6);
    expect(parsed.getDate()).toBe(13);
    expect(parsed.getHours()).toBe(13);
    expect(parsed.getMinutes()).toBe(30);
  });

  it("Türkçe özel karakterli ay adlarını (Ağustos, Eylül) doğru çözer", () => {
    const agustos = sessionService.parseSessionDateTime(
      "5 Ağustos",
      "09:00",
      new Date(2026, 0, 1)
    );
    const eylul = sessionService.parseSessionDateTime(
      "5 Eylül",
      "09:00",
      new Date(2026, 0, 1)
    );

    expect(agustos.getMonth()).toBe(7);
    expect(eylul.getMonth()).toBe(8);
  });

  it("eksik veya bozuk veri için null döner", () => {
    expect(
      sessionService.parseSessionDateTime(null, "13:30")
    ).toBeNull();
    expect(
      sessionService.parseSessionDateTime("13 Temmuz", null)
    ).toBeNull();
    expect(
      sessionService.parseSessionDateTime("Bozuk Metin", "13:30")
    ).toBeNull();
  });
});

describe("sessionService.hasSessionPassed", () => {
  it("referans tarihten önceki bir seans için true döner", () => {
    const result = sessionService.hasSessionPassed(
      "13 Temmuz",
      "13:30",
      new Date(2026, 6, 22, 10, 0)
    );

    expect(result).toBe(true);
  });

  it("referans tarihten sonraki bir seans için false döner", () => {
    const result = sessionService.hasSessionPassed(
      "20 Temmuz",
      "13:30",
      new Date(2026, 6, 13, 10, 0)
    );

    expect(result).toBe(false);
  });

  it("aynı gün ama saati henüz gelmemiş bir seans için false döner", () => {
    const result = sessionService.hasSessionPassed(
      "13 Temmuz",
      "21:00",
      new Date(2026, 6, 13, 13, 30)
    );

    expect(result).toBe(false);
  });

  it("parse edilemeyen veri için güvenli varsayılan olarak false döner", () => {
    expect(
      sessionService.hasSessionPassed(null, null)
    ).toBe(false);
  });
});
