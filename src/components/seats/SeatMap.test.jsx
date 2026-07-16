import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { SEAT_STATUS } from "../../domain/seatStatus.js";
import SeatMap from "./SeatMap.jsx";

describe("SeatMap", () => {
  it("40 koltuklu bir salon için 40 benzersiz koltuk üretir", () => {
    render(
      <SeatMap
        totalSeats={40}
        seatStatuses={{}}
        selectedSeats={[]}
        onSeatSelect={vi.fn()}
      />
    );

    const seatButtons = screen.getAllByRole("button");

    expect(seatButtons).toHaveLength(40);

    const seatLabels = seatButtons.map((button) => {
      return button.textContent;
    });

    expect(new Set(seatLabels).size).toBe(40);
  });

  it("60 koltuklu salonda 10'luk sıra düzenini korur", () => {
    render(
      <SeatMap
        totalSeats={60}
        seatStatuses={{}}
        selectedSeats={[]}
        onSeatSelect={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", {
        name: /A10 numaralı koltuk/,
      })
    ).toBeInTheDocument();
  });

  it("servisten gelen durumu doğru şekilde çözer: DOLU/GECICI_KILITLI yerel seçime üstün gelir", () => {
    render(
      <SeatMap
        totalSeats={40}
        seatStatuses={{
          A1: SEAT_STATUS.DOLU,
          A2: SEAT_STATUS.GECICI_KILITLI,
        }}
        selectedSeats={["A1", "A2", "A3"]}
        onSeatSelect={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk, Dolu/,
      })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: /A2 numaralı koltuk, Geçici kilitli/,
      })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: /A3 numaralı koltuk, Seçili/,
      })
    ).toBeEnabled();
  });

  it("GECICI_KILITLI ve DOLU koltuklarda tıklama seçim çağırmaz, BOS'ta çağırır", () => {
    const handleSeatSelect = vi.fn();

    render(
      <SeatMap
        totalSeats={40}
        seatStatuses={{
          A1: SEAT_STATUS.DOLU,
          A2: SEAT_STATUS.GECICI_KILITLI,
        }}
        selectedSeats={[]}
        onSeatSelect={handleSeatSelect}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /A1 numaralı koltuk/,
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /A2 numaralı koltuk/,
      })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: /A3 numaralı koltuk/,
      })
    );

    expect(handleSeatSelect).toHaveBeenCalledTimes(1);
    expect(handleSeatSelect).toHaveBeenCalledWith("A3");
  });

  it("dört durumu da içeren bir gösterge (legend) render eder", () => {
    render(
      <SeatMap
        totalSeats={40}
        seatStatuses={{}}
        selectedSeats={[]}
        onSeatSelect={vi.fn()}
      />
    );

    expect(screen.getByText("Boş")).toBeInTheDocument();
    expect(screen.getByText("Seçili")).toBeInTheDocument();
    expect(
      screen.getByText("Geçici kilitli")
    ).toBeInTheDocument();
    expect(screen.getByText("Dolu")).toBeInTheDocument();
  });
});
