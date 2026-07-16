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
import movieService from "../services/movieService.js";
import seatService from "../services/seatService.js";
import sessionService from "../services/sessionService.js";
import BookingPage from "./BookingPage.jsx";

vi.mock("../services/movieService.js", () => ({
  default: {
    getMovieById: vi.fn(),
  },
}));

vi.mock("../services/seatService.js", () => ({
  default: {
    getSeatStatusesBySessionId: vi.fn(),
  },
}));

vi.mock("../services/sessionService.js", () => ({
  default: {
    getSessionById: vi.fn(),
  },
}));

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
          <Routes>
            <Route
              path="/booking/:sessionId"
              element={<BookingPage />}
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
      date: "13 Temmuz",
      time: "13:30",
      hallName: "Salon 1",
      price: 220,
      totalSeats: 48,
    });
    movieService.getMovieById.mockResolvedValue({
      id: 1,
      title: "Neon Yağmuru",
    });
    seatService.getSeatStatusesBySessionId.mockResolvedValue(
      {}
    );
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
      within(summary).getByText("220 TL")
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
    seatService.getSeatStatusesBySessionId.mockResolvedValue({
      A1: SEAT_STATUS.DOLU,
      A2: SEAT_STATUS.GECICI_KILITLI,
    });

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

    expect(within(summary).getByText("440 TL"))
      .toBeInTheDocument();

    act(() => {
      queryClient.setQueryData(["reservedSeats", 101], {
        A1: SEAT_STATUS.DOLU,
      });
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
    expect(within(summary).getByText("220 TL"))
      .toBeInTheDocument();
  });
});
