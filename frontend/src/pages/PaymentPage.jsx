import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useCart from "../hooks/useCart.js";
import useAuth from "../hooks/useAuth.js";
import useCountdown from "../hooks/useCountdown.js";
import seatService from "../services/seatService.js";
import reservationService from "../services/reservationService.js";
import { calcSubtotal, formatPrice } from "../services/pricing.js";
import campaignService from "../services/campaignService.js";
import {
  forgetStoredLocks,
  storeLockIds,
} from "../services/seatLockStorage.js";

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
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

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
      isNavigatingToNextStep.current = true;
      navigate("/payment-error");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    // Demo ödeme: 0000 ile başlayan kart reddedilmiş sayılır.
    if (paymentForm.cardNumber.startsWith("0000")) {
      isNavigatingToNextStep.current = true;
      navigate("/payment-error");
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

  return (
    <section>
      <div className="page-heading">
        <h1>Ödeme</h1>

        <p>
          {isLocking ? (
            "Koltuklarınız ayrılıyor…"
          ) : (
            <>
              Koltuklarınız <strong>{formatTime()}</strong> boyunca geçici
              olarak kilitlendi.
            </>
          )}
        </p>

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

            <div className="auth-field">
              <label htmlFor="payment-card-name">Kart Sahibinin Adı</label>
              <input
                id="payment-card-name"
                type="text"
                required
                value={paymentForm.cardName}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="payment-card-number">Kart Numarası (Hata için 0000 ile başlayın)</label>
              <input
                id="payment-card-number"
                type="text"
                required
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
              />
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="payment-card-expiry">Son Kullanma (AA/YY)</label>
                <input
                  id="payment-card-expiry"
                  type="text"
                  required
                  value={paymentForm.expiryDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="payment-card-cvv">CVV</label>
                <input
                  id="payment-card-cvv"
                  type="text"
                  required
                  value={paymentForm.cvv}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={reservationMutation.isPending || isLocking}
          >
            {reservationMutation.isPending
              ? "İşleniyor..."
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
