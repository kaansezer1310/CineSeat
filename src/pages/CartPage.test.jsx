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
import CartPage from "./CartPage.jsx";
import { calcSubtotal, formatPrice } from "../services/pricing.js";
import * as router from "react-router-dom";

vi.mock("../hooks/useAuth.js", () => ({
  default: () => ({
    user: null, // Guest default
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
    mockNavigate.mockReset();
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
    
    // (220 * 1.0) + (220 * 0.75) + (220 * 0.60) = 220 + 165 + 132 = 517
    // locale tr-TR ile 517,00 TL formatlanır
    expect(
      within(summary).getByText("517,00 TL")
    ).toBeInTheDocument();
  });

  it("checkout sırasında /odeme sayfasına yönlendirir", async () => {
    renderCartPage();

    await screen.findByRole("heading", {
      name: "Sepetim",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ödemeye Geç",
      })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/odeme");
    });
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

