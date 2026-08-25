/**
 * Ödeme sağlayıcısı sınırı (T6).
 *
 * Uygulama ödemeyi doğrudan yapmaz; bu arayüzü uygulayan bir adaptöre sorar.
 * Gerçek bir sağlayıcıya (iyzico, Stripe…) geçildiğinde yalnızca yeni bir
 * adaptör yazılır — ödeme ekranı ve rezervasyon akışı değişmez.
 *
 * SÖZLEŞME
 *   charge({ amount, currency, card, description }) → Promise<Result>
 *
 *   Result:
 *     { status: "approved", reference }
 *     { status: "declined", reason }        // kart reddedildi (iş kuralı)
 *     Hata fırlatırsa: sağlayıcıya ulaşılamadı (teknik hata)
 *
 * "Reddedildi" ile "ulaşılamadı" bilerek ayrı: birincisinde kullanıcı başka
 * kart denemeli, ikincisinde aynı kartla tekrar denemek mantıklı.
 */

export const PAYMENT_STATUS = {
  APPROVED: "approved",
  DECLINED: "declined",
};

/**
 * Demo sağlayıcı. Gerçek bir tahsilat YAPMAZ.
 *
 * Kart verisi yalnızca bu fonksiyonun içinde, çağrı süresince yaşar:
 * hiçbir yere kaydedilmez, loglanmaz, rezervasyon isteğine eklenmez.
 * Dışarı çıkan tek şey son dört hanedir (fişte göstermek için).
 */
export function createSimulatedPaymentAdapter({
  latencyMs = 700,
  now = () => Date.now(),
} = {}) {
  return {
    name: "simulated",
    isSimulated: true,

    async charge({ amount, card }) {
      // Ağ gecikmesini taklit et: "İşleniyor…" durumu gerçekten görünsün.
      await new Promise((resolve) => setTimeout(resolve, latencyMs));

      const digits = String(card?.number ?? "").replace(/\D/g, "");

      // Demo kuralları — test edilebilir, akılda kalır senaryolar:
      //   0000… → banka reddetti
      //   9999… → sağlayıcıya ulaşılamadı (teknik hata)
      if (digits.startsWith("0000")) {
        return {
          status: PAYMENT_STATUS.DECLINED,
          reason: "Kartınız banka tarafından reddedildi.",
        };
      }

      if (digits.startsWith("9999")) {
        throw new Error(
          "Ödeme sağlayıcısına ulaşılamadı. Lütfen tekrar deneyin."
        );
      }

      if (amount <= 0) {
        return {
          status: PAYMENT_STATUS.DECLINED,
          reason: "Tahsil edilecek tutar geçersiz.",
        };
      }

      return {
        status: PAYMENT_STATUS.APPROVED,
        reference: `SIM-${now().toString(36).toUpperCase()}`,
        last4: digits.slice(-4),
      };
    },
  };
}

// Uygulamanın kullandığı adaptör. Gerçek sağlayıcıya geçişte değişecek tek satır.
const paymentAdapter = createSimulatedPaymentAdapter();

export default paymentAdapter;
