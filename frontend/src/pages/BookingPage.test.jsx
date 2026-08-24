import {
  act,
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
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import CartProvider from "../context/CartProvider.jsx";
import { SEAT_STATUS } from "../domain/seatStatus.js";
import { TICKET_TYPE } from "../domain/ticketType.js";
import movieService from "../services/movieService.js";
import seatService from "../services/seatService.js";
import sessionService from "../services/sessionService.js";
import useCart from "../hooks/useCart.js";
import BookingPage from "./BookingPage.jsx";

vi.mock("../services/movieService.js", () => ({
  default: {
    getMovieById: vi.fn(),
  },
}));

vi.mock("../services/seatService.js", () => ({
  default: {
    getShowtimeSeatMap: vi.fn(),
  },
}));

// Koltuk kimliği artık backend'in `SeatId`'si; "A1" yalnızca etiket.
// 6 sıra × 8 sütun = 48 koltuk, id'ler 1..48.
function buildSeats(rowCount = 6, columnCount = 8) {
  const seats = [];

  for (let row = 1; row <= rowCount; row += 1) {
    for (let column = 1; column <= columnCount; column += 1) {
      seats.push({
        id: (row - 1) * columnCount + column,
        label: `${String.fromCharCode(64 + row)}${column}`,
        row,
        column,
      });
    }
  }

  return seats;
}

const SEATS = buildSeats();

// Etiket → kimlik: A1=1, A2=2 … B1=9
const A1 = 1;
const A2 = 2;

function seatMap(statuses = {}) {
  return { seats: SEATS, statuses };
}

vi.mock("../services/sessionService.js", () => ({
  default: {
    getSessionById: vi.fn(),
  },
}));

function CartProbe() {
  const { state } = useCart();

  return (
    <pre data-testid="cart-probe">
      {JSON.stringify(state.items)}
    </pre>
  );
}

function renderBookingPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/booking/101"]}>
        <CartProvider>
          <CartProbe />
          <Routes>
            <Route
              path="/booking/:sessionId"
              element={<BookingPage />}
            />
            <Route
              path="/cart"
              element={<div>Sepet sayfası</div>}
            />
          </Routes>
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return queryClient;
}

describe("BookingPage", () => {
  beforeEach(() => {
    sessionService.getSessionById.mockResolvedValue({
      id: 101,
      movieId: 1,
      hallId: 5,
      startDatetime: "2026-07-13T13:30:00+03:00",
      date: "13 Temmuz",
      time: "13:30",
      hallName: "Salon 1",
      cinemaName: "CineSeat Kadıköy",
      price: 220,
      totalSeats: 48,
    });
    movieService.getMovieById.mockResolvedValue({
      id: 1,
      title: "Neon Yağmuru",
    });
    seatService.getShowtimeSeatMap.mockResolvedValue(seatMap());
  });

  it("BOS bir koltuğa tıklayınca SECILI olur ve toplam fiyata yansır", async () => {
    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    const firstSeat = screen.getByRole("button", {
      name: /A1 numaralı koltuk, Boş/,
    });

    fireEvent.click(firstSeat);

    expect(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Seçili/,
      })
    ).toHaveAttribute("aria-pressed", "true");

    const summary = screen.getByRole("complementary");

    expect(
      within(summary).getByText("220,00 TL")
    ).toBeInTheDocument();
  });

  it("SECILI bir koltuk yalnızca tekrar tıklanarak (REQ-01 geri dönüşü) BOS'a döner", async () => {
    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    const firstSeat = screen.getByRole("button", {
      name: /A1 numaralı koltuk, Boş/,
    });

    fireEvent.click(firstSeat);

    expect(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Seçili/,
      })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Seçili/,
      })
    );

    expect(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Boş/,
      })
    ).toBeInTheDocument();
  });

  it("GECICI_KILITLI ve DOLU koltukları ayrı ayrı gösterir ve tıklamayı engeller", async () => {
    seatService.getShowtimeSeatMap.mockResolvedValue(
      seatMap({
        [A1]: SEAT_STATUS.DOLU,
        [A2]: SEAT_STATUS.GECICI_KILITLI,
      })
    );

    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    const doluSeat = screen.getByRole("button", {
      name: /A1 numaralı koltuk, Dolu/,
    });
    const lockedSeat = screen.getByRole("button", {
      name: /A2 numaralı koltuk, Geçici kilitli/,
    });

    expect(doluSeat).toBeDisabled();
    expect(lockedSeat).toBeDisabled();

    fireEvent.click(doluSeat);
    fireEvent.click(lockedSeat);

    const summary = screen.getByRole("complementary");

    expect(
      within(summary).getByText("Henüz seçilmedi")
    ).toBeInTheDocument();
  });

  it("yeni ayrılan koltuğu seçimden çıkarıp diğerlerini korur", async () => {
    const queryClient = renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    const firstSeat = screen.getByRole("button", {
      name: /A1 numaralı koltuk, Boş/,
    });
    const secondSeat = screen.getByRole("button", {
      name: /B1 numaralı koltuk, Boş/,
    });

    fireEvent.click(firstSeat);
    fireEvent.click(secondSeat);

    const summary = screen.getByRole("complementary");

    expect(within(summary).getByText("440,00 TL"))
      .toBeInTheDocument();

    act(() => {
      queryClient.setQueryData(
        ["reservedSeats", 101],
        seatMap({ [A1]: SEAT_STATUS.DOLU })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: /A1 numaralı koltuk, Dolu/,
        })
      ).toBeDisabled();
    });

    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "A1 numaralı koltuk artık müsait olmadığı için seçiminden çıkarıldı."
    );
    expect(within(summary).getByText("B1"))
      .toBeInTheDocument();
    expect(within(summary).getByText("220,00 TL"))
      .toBeInTheDocument();
    expect(
      screen.queryByLabelText("A1 koltuğu bilet tipi")
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("B1 koltuğu bilet tipi")
    ).toBeInTheDocument();
  });

  it("seçilen her koltuk için bilet tipi kontrolü gösterir", async () => {
    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Boş/,
      })
    );

    expect(
      screen.getByLabelText("A1 koltuğu bilet tipi")
    ).toHaveValue(TICKET_TYPE.ADULT);
  });

  it("farklı seçili koltuklara farklı bilet tipi atanabilir", async () => {
    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Boş/,
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /A2 numaralı koltuk, Boş/,
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /A3 numaralı koltuk, Boş/,
      })
    );

    fireEvent.change(
      screen.getByLabelText("A1 koltuğu bilet tipi"),
      { target: { value: TICKET_TYPE.ADULT } }
    );
    fireEvent.change(
      screen.getByLabelText("A2 koltuğu bilet tipi"),
      { target: { value: TICKET_TYPE.STUDENT } }
    );
    fireEvent.change(
      screen.getByLabelText("A3 koltuğu bilet tipi"),
      { target: { value: TICKET_TYPE.CHILD } }
    );

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

  it("seçimi kaldırılan koltuğun bilet tipi verisini siler", async () => {
    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Boş/,
      })
    );

    expect(
      screen.getByLabelText("A1 koltuğu bilet tipi")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Seçili/,
      })
    );

    expect(
      screen.queryByLabelText("A1 koltuğu bilet tipi")
    ).not.toBeInTheDocument();
  });

  it("sepete { seatId, ticketType } nesneleri ekler", async () => {
    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Boş/,
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /A2 numaralı koltuk, Boş/,
      })
    );

    fireEvent.change(
      screen.getByLabelText("A2 koltuğu bilet tipi"),
      { target: { value: TICKET_TYPE.STUDENT } }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sepete Ekle",
      })
    );

    await screen.findByText("Sepet sayfası");

    const cartItems = JSON.parse(
      screen.getByTestId("cart-probe").textContent
    );

    // Sepete backend koltuk kimliği gider; etiket yalnızca gösterim için
    // yanında taşınır.
    expect(cartItems[0].seats).toEqual([
      {
        seatId: A1,
        seatLabel: "A1",
        ticketType: TICKET_TYPE.ADULT,
      },
      {
        seatId: A2,
        seatLabel: "A2",
        ticketType: TICKET_TYPE.STUDENT,
      },
    ]);
  });

  it("bilet tipi değiştirildiğinde toplam fiyata yansır", async () => {
    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Boş/,
      })
    );

    const summary = screen.getByRole("complementary");

    expect(
      within(summary).getByText("220,00 TL")
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("A1 koltuğu bilet tipi"),
      { target: { value: TICKET_TYPE.STUDENT } }
    );

    expect(
      within(summary).getByText("165,00 TL")
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("A1 koltuğu bilet tipi"),
      { target: { value: TICKET_TYPE.CHILD } }
    );

    expect(
      within(summary).getByText("132,00 TL")
    ).toBeInTheDocument();
  });

  it("kilitli veya dolu koltuğu sepete eklemez", async () => {
    seatService.getShowtimeSeatMap.mockResolvedValue(
      seatMap({
        [A1]: SEAT_STATUS.DOLU,
        [A2]: SEAT_STATUS.GECICI_KILITLI,
      })
    );

    renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Dolu/,
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /A2 numaralı koltuk, Geçici kilitli/,
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Sepete Ekle",
      })
    ).toBeDisabled();

    const cartItems = JSON.parse(
      screen.getByTestId("cart-probe").textContent
    );

    expect(cartItems).toEqual([]);
  });
});
