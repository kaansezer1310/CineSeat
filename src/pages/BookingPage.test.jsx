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
    getReservedSeatsBySessionId: vi.fn(),
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
    seatService.getReservedSeatsBySessionId.mockResolvedValue(
      []
    );
  });

  it("yeni ayrılan koltuğu seçimden çıkarıp diğerlerini korur", async () => {
    const queryClient = renderBookingPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    const firstSeat = screen.getByRole("button", {
      name: "A1 numaralı koltuk",
    });
    const secondSeat = screen.getByRole("button", {
      name: "B1 numaralı koltuk",
    });

    fireEvent.click(firstSeat);
    fireEvent.click(secondSeat);

    const summary = screen.getByRole("complementary");

    expect(within(summary).getByText("440 TL"))
      .toBeInTheDocument();

    act(() => {
      queryClient.setQueryData(
        ["reservedSeats", 101],
        ["A1"]
      );
    });

    await waitFor(() => {
      expect(firstSeat).toBeDisabled();
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
