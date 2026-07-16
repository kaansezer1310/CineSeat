import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useEffect } from "react";

import CartProvider from "../context/CartProvider.jsx";
import { TICKET_TYPE } from "../domain/ticketType.js";
import useCart from "../hooks/useCart.js";
import reservationService from "../services/reservationService.js";
import CartPage from "./CartPage.jsx";

vi.mock("../services/reservationService.js", () => ({
  default: {
    createReservation: vi.fn(),
  },
}));

function createCartItem({
  id = "session-101",
  sessionId = 101,
  seats = [
    {
      seatId: "A1",
      ticketType: TICKET_TYPE.ADULT,
    },
    {
      seatId: "A2",
      ticketType: TICKET_TYPE.STUDENT,
    },
    {
      seatId: "A3",
      ticketType: TICKET_TYPE.CHILD,
    },
  ],
} = {}) {
  return {
    id,
    sessionId,
    movieId: 1,
    movieTitle: "Neon Yağmuru",
    date: "13 Temmuz",
    time: "13:30",
    hallName: "Salon 1",
    seats,
    unitPrice: 220,
  };
}

function CartSeeder({ items }) {
  const { dispatch } = useCart();

  useEffect(() => {
    items.forEach((item) => {
      dispatch({
        type: "ADD_TICKET",
        payload: item,
      });
    });
  }, [dispatch, items]);

  return null;
}

function renderCartPage(items = [createCartItem()]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/cart"]}>
        <CartProvider>
          <CartSeeder items={items} />
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/success"
              element={<div>Başarı sayfası</div>}
            />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("CartPage", () => {
  beforeEach(() => {
    reservationService.createReservation.mockReset();
  });

  it("her koltuğun mevcut bilet tipini gösterir", async () => {
    renderCartPage();

    await screen.findByRole("heading", {
      name: "Sepetim",
    });

    expect(
      screen.getByLabelText("A1 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.ADULT);
    expect(
      screen.getByLabelText("A2 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.STUDENT);
    expect(
      screen.getByLabelText("A3 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.CHILD);
  });

  it("bir koltuğun tipini diğerlerini bozmadan değiştirir", async () => {
    renderCartPage();

    await screen.findByRole("heading", {
      name: "Sepetim",
    });

    fireEvent.change(
      screen.getByLabelText("A2 koltuğu bilet tipi"),
      { target: { value: TICKET_TYPE.ADULT } }
    );

    expect(
      screen.getByLabelText("A1 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.ADULT);
    expect(
      screen.getByLabelText("A2 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.ADULT);
    expect(
      screen.getByLabelText("A3 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.CHILD);
  });

  it("Yetişkin, Öğrenci ve Çocuk tiplerinin bir arada kalmasına izin verir", async () => {
    renderCartPage();

    await screen.findByRole("heading", {
      name: "Sepetim",
    });

    expect(
      screen.getByLabelText("A1 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.ADULT);
    expect(
      screen.getByLabelText("A2 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.STUDENT);
    expect(
      screen.getByLabelText("A3 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.CHILD);

    const summary = screen.getByRole("complementary");

    expect(
      within(summary).getByText("3")
    ).toBeInTheDocument();
    expect(
      within(summary).getByText("660 TL")
    ).toBeInTheDocument();
  });

  it("checkout sırasında servise düz seatId listesi gönderir ve tipi korur", async () => {
    reservationService.createReservation.mockResolvedValue({
      id: "CS-1",
      ticketCount: 3,
      totalPrice: 660,
      items: [createCartItem()],
    });

    renderCartPage();

    await screen.findByRole("heading", {
      name: "Sepetim",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Rezervasyonu Tamamla",
      })
    );

    await waitFor(() => {
      expect(
        reservationService.createReservation
      ).toHaveBeenCalledTimes(1);
    });

    const submittedItems =
      reservationService.createReservation.mock.calls[0][0];

    expect(submittedItems[0].seats).toEqual([
      {
        seatId: "A1",
        ticketType: TICKET_TYPE.ADULT,
      },
      {
        seatId: "A2",
        ticketType: TICKET_TYPE.STUDENT,
      },
      {
        seatId: "A3",
        ticketType: TICKET_TYPE.CHILD,
      },
    ]);
    expect(
      submittedItems[0].seats.map((seat) => seat.seatId)
    ).toEqual(["A1", "A2", "A3"]);

    await screen.findByText("Başarı sayfası");
  });

  it("koltuk kimliklerini metin olarak gösterir, [object Object] yazmaz", async () => {
    renderCartPage();

    await screen.findByRole("heading", {
      name: "Sepetim",
    });

    expect(screen.getByText("A1, A2, A3")).toBeInTheDocument();
    expect(screen.queryByText(/\[object Object\]/)).toBeNull();
  });
});
