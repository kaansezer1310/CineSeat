import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import useCart from "../hooks/useCart.js";
import reservationService from "../services/reservationService.js";

function CartPage() {
  const { state, dispatch } = useCart();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const totalTicketCount = state.items.reduce(
    (total, item) => {
      return total + item.seats.length;
    },
    0
  );

  const cartTotal = state.items.reduce(
    (total, item) => {
      const itemTotal =
        item.seats.length * item.unitPrice;

      return total + itemTotal;
    },
    0
  );

  const reservationMutation = useMutation({
    mutationFn: reservationService.createReservation,

    onSuccess: async (
      reservation,
      submittedCartItems
    ) => {
      await Promise.all(
        submittedCartItems.map((item) => {
          return queryClient.invalidateQueries({
            queryKey: [
              "reservedSeats",
              item.sessionId,
            ],
          });
        })
      );

      await Promise.all(
        submittedCartItems.map((item) => {
          return queryClient.invalidateQueries({
            queryKey: [
              "sessions",
              item.movieId,
            ],
          });
        })
      );

      dispatch({
        type: "CLEAR_CART",
      });

      navigate("/success", {
        state: {
          reservation,
        },
      });
    },
  });

  function handleRemoveItem(itemId) {
    if (reservationMutation.isPending) {
      return;
    }

    dispatch({
      type: "REMOVE_TICKET",
      payload: itemId,
    });
  }

  function handleClearCart() {
    if (reservationMutation.isPending) {
      return;
    }

    dispatch({
      type: "CLEAR_CART",
    });
  }

  function handleCheckout() {
    if (
      state.items.length === 0 ||
      reservationMutation.isPending
    ) {
      return;
    }

    const cartSnapshot = state.items.map((item) => {
      return {
        ...item,
        seats: [...item.seats],
      };
    });

    reservationMutation.mutate(cartSnapshot);
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
          disabled={reservationMutation.isPending}
        >
          Sepeti Temizle
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {state.items.map((item) => {
            const itemTotal =
              item.seats.length * item.unitPrice;

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
                        {item.seats.join(", ")}
                      </strong>
                    </p>

                    <p>
                      <span>Bilet fiyatı</span>

                      <strong>
                        {item.unitPrice} TL
                      </strong>
                    </p>

                    <p>
                      <span>Bilet sayısı</span>

                      <strong>
                        {item.seats.length}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="cart-item-actions">
                  <strong className="cart-item-total">
                    {itemTotal} TL
                  </strong>

                  <button
                    className="remove-cart-item-button"
                    type="button"
                    disabled={
                      reservationMutation.isPending
                    }
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

          <div className="cart-summary-total">
            <span>Toplam</span>
            <strong>{cartTotal} TL</strong>
          </div>

          {reservationMutation.isError && (
            <div className="checkout-error">
              <strong>
                Rezervasyon tamamlanamadı
              </strong>

              <p>
                {reservationMutation.error.message}
              </p>
            </div>
          )}

          <button
            className="primary-button cart-checkout-button"
            type="button"
            onClick={handleCheckout}
            disabled={reservationMutation.isPending}
          >
            {reservationMutation.isPending
              ? "Rezervasyon yapılıyor..."
              : "Rezervasyonu Tamamla"}
          </button>

          <p className="checkout-information">
            İşlem tamamlandığında seçilen koltuklar
            dolu olarak kaydedilir.
          </p>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;