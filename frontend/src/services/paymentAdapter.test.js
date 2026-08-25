import { describe, expect, it, vi } from "vitest";

import {
  PAYMENT_STATUS,
  createSimulatedPaymentAdapter,
} from "./paymentAdapter.js";

// Gecikme testlerde beklenmesin.
const adapter = createSimulatedPaymentAdapter({ latencyMs: 0 });

const CARD = { number: "4111 1111 1111 1111", holder: "Ömer", cvv: "123" };

describe("simüle ödeme adaptörü", () => {
  it("kendini simüle olarak tanıtır", () => {
    // Arayüz "demo ödeme" uyarısını buna bakarak gösterebilir.
    expect(adapter.isSimulated).toBe(true);
  });

  it("geçerli kartı onaylar ve referans üretir", async () => {
    const result = await adapter.charge({ amount: 520, card: CARD });

    expect(result.status).toBe(PAYMENT_STATUS.APPROVED);
    expect(result.reference).toMatch(/^SIM-/);
  });

  it("yalnızca son dört haneyi dışarı verir", async () => {
    // Tam kart numarası hiçbir zaman sonuçta dönmemeli.
    const result = await adapter.charge({ amount: 520, card: CARD });

    expect(result.last4).toBe("1111");
    expect(JSON.stringify(result)).not.toContain("4111111111111111");
  });

  it("0000 ile başlayan kartı reddeder", async () => {
    const result = await adapter.charge({
      amount: 520,
      card: { ...CARD, number: "0000111111111111" },
    });

    expect(result.status).toBe(PAYMENT_STATUS.DECLINED);
    expect(result.reason).toMatch(/reddedildi/);
  });

  it("9999 ile başlayan kartta teknik hata fırlatır", async () => {
    // Ret ile teknik hata ayrı: birinde başka kart, diğerinde tekrar deneme.
    await expect(
      adapter.charge({
        amount: 520,
        card: { ...CARD, number: "9999111111111111" },
      })
    ).rejects.toThrow(/ulaşılamadı/);
  });

  it("sıfır tutarı reddeder", async () => {
    const result = await adapter.charge({ amount: 0, card: CARD });

    expect(result.status).toBe(PAYMENT_STATUS.DECLINED);
  });

  it("her çağrıda farklı referans üretir", async () => {
    let counter = 1000;
    const stepping = createSimulatedPaymentAdapter({
      latencyMs: 0,
      now: () => (counter += 7),
    });

    const first = await stepping.charge({ amount: 100, card: CARD });
    const second = await stepping.charge({ amount: 100, card: CARD });

    expect(first.reference).not.toBe(second.reference);
  });

  it("gecikmeyi bekler", async () => {
    vi.useFakeTimers();

    const slow = createSimulatedPaymentAdapter({ latencyMs: 500 });
    const pending = slow.charge({ amount: 100, card: CARD });

    let settled = false;
    pending.then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(499);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(settled).toBe(true);

    vi.useRealTimers();
  });
});
