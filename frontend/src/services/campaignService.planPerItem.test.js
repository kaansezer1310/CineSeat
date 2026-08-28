import { describe, expect, it } from "vitest";

import { planCampaignsPerItem } from "./campaignService.js";

/**
 * Kampanya seçimi KALEM BAZINDA yapılmalı.
 *
 * Backend sepet diye bir şey bilmiyor: sepetteki her seans için ayrı bir
 * rezervasyon oluşuyor ve kampanya koşulları (özellikle MinCartTotal) o
 * rezervasyonun kendi ara toplamına göre doğrulanıyor.
 *
 * Seçim sepetin tamamına göre yapıldığında, eşiği sepet toplamında aşan ama
 * kalem bazında aşmayan durumlarda backend ConflictException fırlatıyordu —
 * indirim uygulanmamakla kalmıyor, ödeme tümden reddediliyordu.
 */
const UYE = { role: "User" };

const YUZDE_ON = {
  id: 1,
  name: "Uyelere Ozel %10",
  type: "Percentage",
  value: 10,
  minCartTotal: 0,
  membersOnly: true,
  isActive: true,
};

const BES_YUZ_USTU = {
  id: 2,
  name: "500 TL Uzeri 75 TL",
  type: "FixedAmount",
  value: 75,
  minCartTotal: 500,
  membersOnly: false,
  isActive: true,
};

// Kalem tutarini dogrudan tasiyan basit bir hesaplayici.
const tutar = (item) => item.total;

describe("planCampaignsPerItem", () => {
  it("eşiği kalem bazında değerlendirir, sepet toplamına göre değil", () => {
    // Sepet 500 ama iki kaleme bolunmus: hicbiri esigi asmiyor.
    const plan = planCampaignsPerItem(
      [BES_YUZ_USTU],
      [{ total: 250 }, { total: 250 }],
      UYE,
      tutar
    );

    expect(plan.lines.every((line) => line.campaign === null)).toBe(true);
    expect(plan.discountTotal).toBe(0);
  });

  it("eşiği aşan kaleme kampanyayı uygular", () => {
    const plan = planCampaignsPerItem(
      [BES_YUZ_USTU],
      [{ total: 600 }, { total: 100 }],
      UYE,
      tutar
    );

    expect(plan.lines[0].campaign).toEqual(BES_YUZ_USTU);
    expect(plan.lines[0].discount).toBe(75);

    expect(plan.lines[1].campaign).toBeNull();
    expect(plan.lines[1].discount).toBe(0);

    expect(plan.discountTotal).toBe(75);
  });

  it("her kalem için en iyi kampanyayı ayrı ayrı seçer", () => {
    const plan = planCampaignsPerItem(
      [YUZDE_ON, BES_YUZ_USTU],
      [{ total: 1000 }, { total: 200 }],
      UYE,
      tutar
    );

    // 1000 TL'de %10 = 100 > 75, yuzde kampanyasi kazanir.
    expect(plan.lines[0].campaign).toEqual(YUZDE_ON);
    expect(plan.lines[0].discount).toBe(100);

    // 200 TL'de tek uygulanabilir olan %10 = 20.
    expect(plan.lines[1].campaign).toEqual(YUZDE_ON);
    expect(plan.lines[1].discount).toBe(20);

    expect(plan.discountTotal).toBe(120);
  });

  it("üyelere özel kampanyayı misafire vermez", () => {
    const plan = planCampaignsPerItem(
      [YUZDE_ON],
      [{ total: 300 }],
      { role: "guest" },
      tutar
    );

    expect(plan.lines[0].campaign).toBeNull();
    expect(plan.discountTotal).toBe(0);
  });

  it("boş sepette sıfır indirim verir", () => {
    const plan = planCampaignsPerItem([YUZDE_ON], [], UYE, tutar);

    expect(plan.lines).toEqual([]);
    expect(plan.discountTotal).toBe(0);
  });

  it("kampanya yokken sıfır indirim verir", () => {
    const plan = planCampaignsPerItem([], [{ total: 900 }], UYE, tutar);

    expect(plan.lines[0].campaign).toBeNull();
    expect(plan.discountTotal).toBe(0);
  });
});
