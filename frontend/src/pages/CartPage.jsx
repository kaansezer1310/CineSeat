import {
  Link,
  useNavigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  TICKET_TYPE_LIST,
  getTicketTypeLabel,
  isValidTicketType,
} from "../domain/ticketType.js";
import Stepper from "../components/ui/Stepper.jsx";
import useCart from "../hooks/useCart.js";
import useAuth from "../hooks/useAuth.js";
import { calcItemTotal, calcSubtotal, formatPrice } from "../services/pricing.js";
import campaignService from "../services/campaignService.js";

function CartPage() {
  const { state, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalTicketCount = state.items.reduce(
    (total, item) => {
      return total + item.seats.length;
    },
    0
  );

  const subtotal = calcSubtotal(state.items);

  // Kampanyalar backend'den geliyor; buradaki hesap yalnızca ÖN İZLEME.
  // Bağlayıcı tutarı rezervasyon oluşurken sunucu hesaplar (istemciden
  // toplam gönderilmez, yalnızca kampanya id'si).
  const { data: campaigns = [] } = useQuery({
    queryKey: ["activeCampaigns"],
    queryFn: campaignService.getActiveCampaigns,
    staleTime: 5 * 60 * 1000,
  });

  const appliedCampaign = campaignService.pickBestCampaign(
    campaigns,
    subtotal,
    user
  );
  const discountAmount = campaignService.calculateDiscount(
    appliedCampaign,
    subtotal
  );
  const cartTotal = subtotal - discountAmount;

  function handleRemoveItem(itemId) {
    dispatch({
      type: "REMOVE_TICKET",
      payload: itemId,
    });
  }

  function handleClearCart() {
    dispatch({
      type: "CLEAR_CART",
    });
  }

  function handleTicketTypeChange(
    sessionId,
    seatId,
    ticketType
  ) {
    if (!isValidTicketType(ticketType)) {
      return;
    }

    dispatch({
      type: "UPDATE_TICKET_TYPE",
      payload: {
        sessionId,
        seatId,
        ticketType,
      },
    });
  }

  function handleCheckout() {
    if (state.items.length === 0) {
      return;
    }

    navigate("/payment");
  }

  if (state.items.length === 0) {
    return (
      <section>
        <div className="page-heading cart-empty-intro">
          <h1>Sepetin boş</h1>

          <p>
            Henüz bilet eklemedin. Vizyondaki filmleri
            inceleyerek seans ve koltuk seçebilirsin.
          </p>

          <Link
            className="primary-button"
            to="/movies"
          >
            Filmleri İncele
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="cart-page-heading">
        <div className="page-heading">
          <h1>Sepetim</h1>

          <p>
            Seçtiğin seansları ve koltukları kontrol
            edebilirsin.
          </p>

          <Stepper
            steps={["Koltuk", "Bilet Tipi", "Ödeme"]}
            currentStepIndex={1}
          />
        </div>

        <button
          className="btn btn--secondary btn--sm"
          type="button"
          onClick={handleClearCart}
        >
          Sepeti Temizle
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {state.items.map((item) => {
            const itemTotal = calcItemTotal(item);

            return (
              <article
                className="cart-item"
                key={item.id}
              >
                <div className="cart-item-content">
                  <p className="cart-item-session">
                    {item.date} · {item.time} ·{" "}
                    {item.hallName}
                  </p>

                  <h2>{item.movieTitle}</h2>

                  <div className="cart-item-details">
                    <p>
                      <span>Koltuklar</span>

                      <strong>
                        {item.seats
                          .map((seat) => seat.seatLabel ?? seat.seatId)
                          .join(", ")}
                      </strong>
                    </p>

                    <p>
                      <span>Bilet fiyatı</span>

                      <strong>
                        {formatPrice(item.unitPrice)} TL
                      </strong>
                    </p>

                    <p>
                      <span>Bilet sayısı</span>

                      <strong>
                        {item.seats.length}
                      </strong>
                    </p>
                  </div>

                  <div className="cart-ticket-types">
                    <span className="cart-ticket-types-heading">
                      Bilet tipi
                    </span>

                    <ul className="ticket-type-list">
                      {item.seats.map((seat) => {
                        const selectId =
                          `cart-ticket-type-${item.sessionId}-${seat.seatId}`;

                        return (
                          <li
                            className="ticket-type-row"
                            key={`${item.sessionId}-${seat.seatId}`}
                          >
                            <label htmlFor={selectId}>
                              {seat.seatLabel ?? seat.seatId} koltuğu
                              <span className="visually-hidden">
                                {" "}
                                bilet tipi
                              </span>
                            </label>

                            <div className="ticket-type-select-wrap">
                              <select
                                className="ticket-type-select"
                                id={selectId}
                                value={seat.ticketType}
                                onChange={(event) => {
                                  handleTicketTypeChange(
                                    item.sessionId,
                                    seat.seatId,
                                    event.target.value
                                  );
                                }}
                              >
                                {TICKET_TYPE_LIST.map(
                                  (optionType) => {
                                    return (
                                      <option
                                        key={optionType}
                                        value={optionType}
                                      >
                                        {getTicketTypeLabel(
                                          optionType
                                        )}
                                      </option>
                                    );
                                  }
                                )}
                              </select>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <strong className="cart-item-total">
                    {formatPrice(itemTotal)} TL
                  </strong>

                  <button
                    className="remove-cart-item-button"
                    type="button"
                    onClick={() => {
                      handleRemoveItem(item.id);
                    }}
                  >
                    Sepetten Kaldır
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Sipariş Özeti</h2>

          <div className="cart-summary-row">
            <span>Seans sayısı</span>
            <strong>{state.items.length}</strong>
          </div>

          <div className="cart-summary-row">
            <span>Bilet sayısı</span>
            <strong>{totalTicketCount}</strong>
          </div>

          <div
            className={
              discountAmount > 0
                ? "cart-summary-total cart-summary-total--subtotal"
                : "cart-summary-total"
            }
          >
            <span>Ara Toplam</span>
            <strong>{formatPrice(subtotal)} TL</strong>
          </div>
          
          {appliedCampaign && discountAmount > 0 && (
            <div className="cart-summary-row cart-summary-row--discount">
              <span>{appliedCampaign.name}</span>
              <strong>-{formatPrice(discountAmount)} TL</strong>
            </div>
          )}
          
          {discountAmount > 0 && (
             <div className="cart-summary-total cart-summary-total--payable">
               <span>Ödenecek Tutar</span>
               <strong>{formatPrice(cartTotal)} TL</strong>
             </div>
          )}

          <button
            className="btn btn--primary btn--lg cart-checkout-button"
            type="button"
            onClick={handleCheckout}
          >
            Ödemeye Geç
          </button>

          <p className="checkout-information">
            Bir sonraki adımda ziyaretçi bilgileri ve ödeme alınacaktır.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
