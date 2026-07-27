import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  TICKET_TYPE_LIST,
  getTicketTypeLabel,
  isValidTicketType,
} from "../domain/ticketType.js";
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
  const { discountAmount, campaignsApplied } = campaignService.getCampaignDiscount(subtotal, user);
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

    navigate("/odeme");
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
            to="/"
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
        </div>

        <button
          className="secondary-button"
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
                          .map((seat) => seat.seatId)
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
                              {seat.seatId} koltuğu
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

          <div className="cart-summary-total" style={{ borderBottom: discountAmount > 0 ? 'none' : undefined, paddingBottom: discountAmount > 0 ? 0 : undefined }}>
            <span>Ara Toplam</span>
            <strong>{formatPrice(subtotal)} TL</strong>
          </div>
          
          {campaignsApplied.map((campaign, index) => (
            <div className="cart-summary-row" key={index} style={{ color: 'var(--color-success)', marginTop: '0.5rem' }}>
              <span>{campaign.name}</span>
              <strong>-{formatPrice(campaign.amount)} TL</strong>
            </div>
          ))}
          
          {discountAmount > 0 && (
             <div className="cart-summary-total" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
               <span>Ödenecek Tutar</span>
               <strong>{formatPrice(cartTotal)} TL</strong>
             </div>
          )}

          <button
            className="primary-button cart-checkout-button"
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
