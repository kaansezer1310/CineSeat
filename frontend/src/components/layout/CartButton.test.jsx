import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import useCart from "../../hooks/useCart.js";
import { TICKET_TYPE } from "../../domain/ticketType.js";
import CartButton from "./CartButton.jsx";

function CartSeeder({ items }) {
  const { dispatch } = useCart();

  useEffect(() => {
    items.forEach((item) => {
      dispatch({ type: "ADD_TICKET", payload: item });
    });
  }, [items, dispatch]);

  return null;
}

function renderCartButton(items = []) {
  render(
    <MemoryRouter>
      <CartProvider>
        <CartSeeder items={items} />
        <CartButton />
      </CartProvider>
    </MemoryRouter>
  );
}

describe("CartButton", () => {
  it("sepet boşken rozet göstermez", () => {
    renderCartButton();

    expect(screen.getByRole("link", { name: "Sepet" })).toHaveAttribute(
      "href",
      "/cart"
    );
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("sepette bilet varken toplam koltuk sayısını rozette gösterir", () => {
    renderCartButton([
      {
        id: "session-101",
        sessionId: 101,
        movieId: 1,
        movieTitle: "Neon Yağmuru",
        date: "13 Temmuz",
        time: "13:30",
        hallName: "Salon 1",
        seats: [
          { seatId: "A1", ticketType: TICKET_TYPE.ADULT },
          { seatId: "A2", ticketType: TICKET_TYPE.STUDENT },
        ],
        unitPrice: 220,
      },
    ]);

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
