import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useCart from "../hooks/useCart.js";
import useAuth from "../hooks/useAuth.js";
import useCountdown from "../hooks/useCountdown.js";
import Stepper from "../components/ui/Stepper.jsx";
import seatService from "../services/seatService.js";
import reservationService from "../services/reservationService.js";
import { calcSubtotal, formatPrice } from "../services/pricing.js";
import campaignService from "../services/campaignService.js";
import {
  forgetStoredLocks,
  storeLockIds,
} from "../services/seatLockStorage.js";
import paymentAdapter, {
  PAYMENT_STATUS,
} from "../services/paymentAdapter.js";
import {
  detectCardBrand,
  formatCardNumber,
  getExpectedCvvLength,
  normalizeCardNumber,
  validateCardForm,
  CARD_BRANDS,
} from "../domain/card.js";

function secondsUntil(isoDate) {
  const expiresAt = new Date(isoDate).getTime();
  if (Number.isNaN(expiresAt)) {
    return 0;
  }

  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
}

function PaymentPage() {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [paymentForm, setPaymentForm] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [cardErrors, setCardErrors] = useState({});
  const [paymentError, setPaymentError] = useState("");
  const [isCharging, setIsCharging] = useState(false);

  // Çift gönderim kilidi. `isCharging` state'i bir sonraki render'da güncellenir;
  // arka arkaya iki tıklama arasında henüz güncellenmemiş olabilir. Ref anında
  // değiştiği için ikinci tıklama kesin olarak elenir.
  const isSubmittingRef = useRef(false);

  // Backend alıcı bilgisini zorunlu tutuyor (BuyerFname/Lname/Email).
  // Oturumdaki kullanıcıdan ön doldurulur, kullanıcı değiştirebilir.
  const [buyerForm, setBuyerForm] = useState(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
  }));

  const isNavigatingToNextStep = useRef(false);
  const lockIdsRef = useRef([]);

  const [lockError, setLockError] = useState("");
  const [lockExpiresAt, setLockExpiresAt] = useState(null);

  // Koltukları kilitle. Sepet ödeme sırasında değişmediği için bu etki
  // yalnızca girişte bir kez çalışır.
  useEffect(() => {
    if (state.items.length === 0) {
      navigate("/cart");
      return;
    }

    let isCancelled = false;

    async function acquireLocks() {
      const acquired = [];

      try {
        for (const item of state.items) {
          const locks = await seatService.lockSeats({
            showtimeId: item.sessionId,
            seatIds: item.seats.map((seat) => seat.seatId),
          });

          acquired.push(...locks);
        }
      } catch (error) {
        await seatService.releaseLocks(acquired.map((lock) => lock.id));

        if (!isCancelled) {
          setLockError(
            error.message ||
              "Seçtiğiniz koltuklardan biri artık müsait değil."
          );
        }
        return;
      }

      if (isCancelled) {
        await seatService.releaseLocks(acquired.map((lock) => lock.id));
        return;
      }

      lockIdsRef.current = acquired.map((lock) => lock.id);
      storeLockIds(lockIdsRef.current);

      // Sayaç en ERKEN biten kilide göre kurulur; ilk kilit düştüğü an
      // seçim zaten bütünlüğünü kaybeder.
      const earliest = acquired.reduce(
        (min, lock) =>
          min === null || lock.lockExpiresAt < min ? lock.lockExpiresAt : min,
        null
      );

      setLockExpiresAt(earliest);
    }

    acquireLocks();

    return () => {
      isCancelled = true;

      // Başarı/hata sayfasına gidiyorsak kilitleri orası devralır.
      if (!isNavigatingToNextStep.current) {
        seatService.releaseLocks(lockIdsRef.current);
        forgetStoredLocks();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTimeout() {
    seatService.releaseLocks(lockIdsRef.current);
    forgetStoredLocks();
    dispatch({ type: "CLEAR_CART" });
    navigate("/cart");
  }

  const { formatTime } = useCountdown(
    lockExpiresAt ? secondsUntil(lockExpiresAt) : 0,
    lockExpiresAt ? handleTimeout : undefined
  );

  const subtotal = calcSubtotal(state.items);

  // Kampanyalar backend'den geliyor. Buradaki hesap yalnızca ÖN İZLEME —
  // bağlayıcı tutarı rezervasyon oluşurken backend hesaplar; istemci
  // yalnızca kampanyanın id'sini gönderir.
  const { data: campaigns = [] } = useQuery({
    queryKey: ["activeCampaigns"],
    queryFn: campaignService.getActiveCampaigns,
    staleTime: 5 * 60 * 1000,
  });

  const bestCampaign = campaignService.pickBestCampaign(
    campaigns,
    subtotal,
    user
  );
  const discountAmount = campaignService.calculateDiscount(
    bestCampaign,
    subtotal
  );
  const cartTotal = subtotal - discountAmount;

  const reservationMutation = useMutation({
    mutationFn: reservationService.createReservation,
    onSuccess: async (reservations) => {
      await Promise.all(
        state.items.map((item) =>
          queryClient.invalidateQueries({
            queryKey: ["reservedSeats", item.sessionId],
          })
        )
      );

      // Koltuklar artık rezerve; kilit satırları kendiliğinden düşecek.
      forgetStoredLocks();
      dispatch({ type: "CLEAR_CART" });

      isNavigatingToNextStep.current = true;
      navigate("/success", { state: { reservations } });
    },
    onError: () => {
      // Ödeme onaylandı ama rezervasyon oluşmadı: kullanıcı hata sayfasına
      // gider, kilit orada çözülür.
      releaseSubmitLock();
      isNavigatingToNextStep.current = true;
      navigate("/payment-error");
    },
  });

  async function handleSubmit(event) {
    event.preventDefault();

    // Çift gönderim: kullanıcı butona iki kez basarsa ikinci istek atılmaz.
    if (isSubmittingRef.current) {
      return;
    }

    setPaymentError("");

    const errors = validateCardForm(paymentForm);
    setCardErrors(errors);

    if (Object.keys(errors).length > 0) {
      // İlk hatalı alana odaklan: kullanıcı hangi alanı düzelteceğini
      // aramak zorunda kalmasın.
      const firstField = Object.keys(errors)[0];
      document.getElementById(`payment-${firstField}`)?.focus();
      return;
    }

    isSubmittingRef.current = true;
    setIsCharging(true);

    try {
      // Kart verisi YALNIZCA buraya girer. Rezervasyon isteğine eklenmez,
      // hiçbir yere kaydedilmez, loglanmaz.
      const result = await paymentAdapter.charge({
        amount: cartTotal,
        currency: "TRY",
        description: "CineSeat bilet",
        card: {
          number: normalizeCardNumber(paymentForm.cardNumber),
          holder: paymentForm.cardHolder.trim(),
          expiry: paymentForm.expiry,
          cvv: paymentForm.cvv,
        },
      });

      if (result.status === PAYMENT_STATUS.DECLINED) {
        isNavigatingToNextStep.current = true;
        navigate("/payment-error", { state: { reason: result.reason } });
        return;
      }

      const cartSnapshot = state.items.map((item) => ({
        ...item,
        seats: item.seats.map((seat) => ({ ...seat })),
      }));

      reservationMutation.mutate({
        cartItems: cartSnapshot,
        buyer: {
          firstName: buyerForm.firstName.trim(),
          lastName: buyerForm.lastName.trim(),
          email: buyerForm.email.trim(),
        },
        campaignId: bestCampaign?.id ?? null,
      });
    } catch (error) {
      // Teknik hata: aynı kartla tekrar denemek mantıklı, sayfada kalıyoruz.
      setPaymentError(
        error.message || "Ödeme alınamadı. Lütfen tekrar deneyin."
      );
      isSubmittingRef.current = false;
      setIsCharging(false);
    }
  }

  /** Alan değişince o alanın hatası silinir — kullanıcı yazarken uyarı kalmaz. */
  function updateCardField(field, value) {
    setPaymentForm((current) => ({ ...current, [field]: value }));

    setCardErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  /** "1226" → "12/26"; kullanıcı eğik çizgiyi kendi yazmak zorunda kalmasın. */
  function formatExpiry(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    return digits.length <= 2
      ? digits
      : `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  // Rezervasyon adımı bittiğinde (başarılı ya da hatalı) kilidi çöz.
  function releaseSubmitLock() {
    isSubmittingRef.current = false;
    setIsCharging(false);
  }

  if (state.items.length === 0) {
    return null;
  }

  // Kilit alınamadıysa ödeme formunu göstermenin anlamı yok — koltuklar
  // zaten elde değil.
  if (lockError) {
    return (
      <section>
        <div className="page-heading">
          <h1>Koltuklar ayrılamadı</h1>
          <p>{lockError}</p>
        </div>

        <div className="page-actions">
          <button
            className="primary-button"
            type="button"
            onClick={() => navigate("/cart")}
          >
            Sepete Dön
          </button>
        </div>
      </section>
    );
  }

  const isLocking = lockExpiresAt === null;

  const cardBrand = detectCardBrand(paymentForm.cardNumber);
  const cardBrandLabel = cardBrand ? CARD_BRANDS[cardBrand].label : null;
  const expectedCvvLength = getExpectedCvvLength(paymentForm.cardNumber);

  return (
    <section>
      <div className="page-heading">
        <h1>Ödeme</h1>

        <Stepper
          steps={["Koltuk", "Bilet Tipi", "Ödeme"]}
          currentStepIndex={2}
        />

        {isLocking ? (
          <p>Koltuklarınız ayrılıyor…</p>
        ) : (
          <div className="payment-countdown" role="status">
            <span className="payment-countdown-label">
              Koltuklarınız için kalan süre
            </span>
            <span className="payment-countdown-time">{formatTime()}</span>
          </div>
        )}

        <p className="payment-demo-notice" role="note">
          Bu bir <strong>demo ödemedir</strong>. Gerçek bir tahsilat yapılmaz
          ve kart bilgileriniz hiçbir yere kaydedilmez.
        </p>
      </div>

      <div className="payment-layout">
        <form className="auth-form payment-form" onSubmit={handleSubmit}>

          <div className="form-group-section">
            <h2>Alıcı Bilgileri</h2>

            <div className="auth-field">
              <label htmlFor="payment-buyer-first-name">Ad</label>
              <input
                id="payment-buyer-first-name"
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={buyerForm.firstName}
                onChange={(e) =>
                  setBuyerForm({ ...buyerForm, firstName: e.target.value })
                }
              />
            </div>

            <div className="auth-field">
              <label htmlFor="payment-buyer-last-name">Soyad</label>
              <input
                id="payment-buyer-last-name"
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={buyerForm.lastName}
                onChange={(e) =>
                  setBuyerForm({ ...buyerForm, lastName: e.target.value })
                }
              />
            </div>

            <div className="auth-field">
              <label htmlFor="payment-buyer-email">E-posta</label>
              <input
                id="payment-buyer-email"
                type="email"
                required
                value={buyerForm.email}
                onChange={(e) =>
                  setBuyerForm({ ...buyerForm, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group-section">
            <h2>Kart Bilgileri</h2>

            {paymentError && (
              <p className="auth-error" role="alert">
                {paymentError}
              </p>
            )}

            <div className="auth-field">
              <label htmlFor="payment-cardHolder">Kart Sahibinin Adı</label>
              <input
                id="payment-cardHolder"
                type="text"
                autoComplete="cc-name"
                value={paymentForm.cardHolder}
                aria-invalid={cardErrors.cardHolder ? true : undefined}
                aria-describedby={
                  cardErrors.cardHolder ? "payment-cardHolder-error" : undefined
                }
                onChange={(event) =>
                  updateCardField("cardHolder", event.target.value)
                }
              />
              {cardErrors.cardHolder && (
                <span
                  className="auth-field-error"
                  id="payment-cardHolder-error"
                >
                  {cardErrors.cardHolder}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="payment-cardNumber">
                Kart Numarası
                {cardBrandLabel && (
                  <span className="payment-card-brand"> · {cardBrandLabel}</span>
                )}
              </label>
              <input
                id="payment-cardNumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                value={paymentForm.cardNumber}
                aria-invalid={cardErrors.cardNumber ? true : undefined}
                aria-describedby={
                  cardErrors.cardNumber
                    ? "payment-cardNumber-error"
                    : "payment-cardNumber-hint"
                }
                onChange={(event) =>
                  // Boşluklar girilirken eklenir; doğrulama her zaman ham
                  // rakamlar üzerinden yapılır.
                  updateCardField(
                    "cardNumber",
                    formatCardNumber(event.target.value)
                  )
                }
              />
              {cardErrors.cardNumber ? (
                <span className="auth-field-error" id="payment-cardNumber-error">
                  {cardErrors.cardNumber}
                </span>
              ) : (
                <small id="payment-cardNumber-hint">
                  Demo: 0000 ile başlayan kart reddedilir, 9999 ile başlayan
                  teknik hata verir.
                </small>
              )}
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="payment-expiry">Son Kullanma (AA/YY)</label>
                <input
                  id="payment-expiry"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="AA/YY"
                  maxLength={5}
                  value={paymentForm.expiry}
                  aria-invalid={cardErrors.expiry ? true : undefined}
                  aria-describedby={
                    cardErrors.expiry ? "payment-expiry-error" : undefined
                  }
                  onChange={(event) =>
                    updateCardField("expiry", formatExpiry(event.target.value))
                  }
                />
                {cardErrors.expiry && (
                  <span className="auth-field-error" id="payment-expiry-error">
                    {cardErrors.expiry}
                  </span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="payment-cvv">
                  CVV ({expectedCvvLength} hane)
                </label>
                <input
                  id="payment-cvv"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={expectedCvvLength}
                  value={paymentForm.cvv}
                  aria-invalid={cardErrors.cvv ? true : undefined}
                  aria-describedby={
                    cardErrors.cvv ? "payment-cvv-error" : undefined
                  }
                  onChange={(event) =>
                    updateCardField(
                      "cvv",
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                />
                {cardErrors.cvv && (
                  <span className="auth-field-error" id="payment-cvv-error">
                    {cardErrors.cvv}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={isCharging || reservationMutation.isPending || isLocking}
          >
            {isCharging || reservationMutation.isPending
              ? "İşleniyor…"
              : isLocking
                ? "Koltuklar ayrılıyor…"
                : `${formatPrice(cartTotal)} TL Öde`}
          </button>
        </form>

        <aside className="payment-summary">
          <div className="cart-summary">
            <h2>Sipariş Özeti</h2>

            <div className="cart-summary-row">
              <span>Ara toplam</span>
              <strong>{formatPrice(subtotal)} TL</strong>
            </div>

            {bestCampaign && (
              <div className="cart-summary-row cart-summary-row--discount">
                <span>{bestCampaign.name}</span>
                <strong>-{formatPrice(discountAmount)} TL</strong>
              </div>
            )}

            <div className="cart-summary-total">
              <span>Toplam Ödenecek</span>
              <strong>{formatPrice(cartTotal)} TL</strong>
            </div>

            <p className="payment-summary-note">
              Kesin tutar ödeme onaylandığında sunucuda hesaplanır.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PaymentPage;
