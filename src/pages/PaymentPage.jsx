import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useCart from "../hooks/useCart.js";
import useAuth from "../hooks/useAuth.js";
import useCountdown from "../hooks/useCountdown.js";
import seatService from "../services/seatService.js";
import reservationService from "../services/reservationService.js";
import { calcSubtotal, formatPrice } from "../services/pricing.js";
import campaignService from "../services/campaignService.js";

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

  const [visitorForm, setVisitorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const isNavigatingToNextStep = useRef(false);

  // Token ve Timer Başlangıcı
  const [lockToken] = useState(() => {
    let token = sessionStorage.getItem("cineseat_lock_token");
    if (!token) {
      token = Math.random().toString(36).substring(2);
      sessionStorage.setItem("cineseat_lock_token", token);
    }
    return token;
  });

  const [initialTimeRemaining] = useState(() => {
    let expiresAt = sessionStorage.getItem("cineseat_lock_expires");
    if (!expiresAt) {
      expiresAt = Date.now() + 180000;
      sessionStorage.setItem("cineseat_lock_expires", expiresAt.toString());
    }
    const remaining = Math.max(0, Math.floor((parseInt(expiresAt) - Date.now()) / 1000));
    return remaining;
  });

  function handleTimeout() {
    sessionStorage.removeItem("cineseat_lock_token");
    sessionStorage.removeItem("cineseat_lock_expires");
    dispatch({ type: "CLEAR_CART" });
    navigate("/cart");
  }

  const { formatTime } = useCountdown(initialTimeRemaining, () => {
    handleTimeout();
  });

  // Kilitleme/kilit-açma yalnızca sayfaya girişte/çıkışta bir kez çalışmalı;
  // sepet ödeme sırasında zaten değişmez (payload gönderilene kadar), bu
  // yüzden `state.items` kasıtlı olarak dep listesine alınmadı. `navigate`
  // react-router'da referans olarak sabittir.
  useEffect(() => {
    if (state.items.length === 0) {
      navigate("/cart");
      return;
    }

    // Koltukları kilitle
    const lockPromises = state.items.map((item) =>
      seatService.lockSeats({
        sessionId: item.sessionId,
        seats: item.seats.map((seat) => seat.seatId),
        lockToken,
      }).catch(() => {
        // Zaten doluysa sepete geri dön
        navigate("/cart");
      })
    );

    Promise.all(lockPromises);

    return () => {
      // Unmount olduğunda, eğer başarı veya hata sayfasına gitmiyorsak kilitleri aç
      if (!isNavigatingToNextStep.current) {
        state.items.forEach((item) => {
          seatService.releaseLockedSeats({
            sessionId: item.sessionId,
            seats: item.seats.map((seat) => seat.seatId),
            lockToken,
          });
        });
        sessionStorage.removeItem("cineseat_lock_token");
        sessionStorage.removeItem("cineseat_lock_expires");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = calcSubtotal(state.items);
  const { discountAmount } = campaignService.getCampaignDiscount(subtotal, user);
  const cartTotal = subtotal - discountAmount;

  const reservationMutation = useMutation({
    mutationFn: reservationService.createReservation,
    onSuccess: async (reservation, submittedCartItems) => {
      await Promise.all(
        submittedCartItems.map((item) =>
          queryClient.invalidateQueries({ queryKey: ["reservedSeats", item.sessionId] })
        )
      );
      sessionStorage.removeItem("cineseat_lock_token");
      sessionStorage.removeItem("cineseat_lock_expires");
      dispatch({ type: "CLEAR_CART" });
      
      isNavigatingToNextStep.current = true;
      navigate("/success", { state: { reservation } });
    },
    onError: () => {
      isNavigatingToNextStep.current = true;
      navigate("/odeme-hata");
    }
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (paymentForm.cardNumber.startsWith("0000")) {
      isNavigatingToNextStep.current = true;
      navigate("/odeme-hata");
      return;
    }

    const cartSnapshot = state.items.map((item) => ({
      ...item,
      seats: item.seats.map((seat) => ({ ...seat })),
    }));

    const payload = {
      cartItems: cartSnapshot,
      visitorInfo: (!user || user.role === "guest") ? visitorForm : null,
      lockToken,
    };

    reservationMutation.mutate(payload);
  }

  if (state.items.length === 0) {
    return null; // or redirecting
  }

  return (
    <section>
      <div className="page-heading">
        <h1>Ödeme</h1>
        <p>
          Koltuklarınız <strong>{formatTime()}</strong> boyunca geçici olarak kilitlendi.
        </p>
      </div>

      <div className="payment-layout">
        <form className="auth-form payment-form" onSubmit={handleSubmit}>

          {(!user || user.role === "guest") && (
            <div className="form-group-section">
              <h2>Ziyaretçi Bilgileri</h2>

              <div className="auth-field">
                <label htmlFor="payment-visitor-first-name">Ad</label>
                <input
                  id="payment-visitor-first-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  value={visitorForm.firstName}
                  onChange={(e) => setVisitorForm({ ...visitorForm, firstName: e.target.value })}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="payment-visitor-last-name">Soyad</label>
                <input
                  id="payment-visitor-last-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={50}
                  value={visitorForm.lastName}
                  onChange={(e) => setVisitorForm({ ...visitorForm, lastName: e.target.value })}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="payment-visitor-email">E-posta</label>
                <input
                  id="payment-visitor-email"
                  type="email"
                  required
                  value={visitorForm.email}
                  onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })}
                />
              </div>
            </div>
          )}

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
            disabled={reservationMutation.isPending}
          >
            {reservationMutation.isPending ? "İşleniyor..." : `${formatPrice(cartTotal)} TL Öde`}
          </button>
        </form>

        <aside className="payment-summary">
          <div className="cart-summary">
            <h2>Sipariş Özeti</h2>
            <div className="cart-summary-total">
              <span>Toplam Ödenecek</span>
              <strong>{formatPrice(cartTotal)} TL</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PaymentPage;
