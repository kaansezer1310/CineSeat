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
import { formatSeatLabel } from "../../domain/seat.js";
import SeatMap from "./SeatMap.jsx";

// Koltuklar artık salonun gerçek kayıtlarından geliyor: id backend'in
// `SeatId`'si, etiket (satır, sütun) çiftinden türetiliyor.
function buildSeats(rowCount, columnCount) {
  const seats = [];

  for (let row = 1; row <= rowCount; row += 1) {
    for (let column = 1; column <= columnCount; column += 1) {
      const id = (row - 1) * columnCount + column;

      seats.push({
        id,
        label: formatSeatLabel(row, column),
        row,
        column,
      });
    }
  }

  return seats;
}

const FIVE_BY_EIGHT = buildSeats(5, 8);

// A1, A2, A3 → id 1, 2, 3
const A1 = 1;
const A2 = 2;
const A3 = 3;

describe("SeatMap", () => {
  it("verilen koltukların tamamını benzersiz etiketlerle render eder", () => {
    render(
      <SeatMap
        seats={FIVE_BY_EIGHT}
        seatStatuses={{}}
        selectedSeats={[]}
        onSeatSelect={vi.fn()}
      />
    );

    const seatButtons = screen.getAllByRole("button");

    expect(seatButtons).toHaveLength(40);

    const seatLabels = seatButtons.map((button) => button.textContent);
    expect(new Set(seatLabels).size).toBe(40);
  });

  it("10 sütunlu salonda A10 koltuğunu üretir", () => {
    render(
      <SeatMap
        seats={buildSeats(6, 10)}
        seatStatuses={{}}
        selectedSeats={[]}
        onSeatSelect={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /A10 numaralı koltuk/ })
    ).toBeInTheDocument();
  });

  it("devre dışı koltuklar listede yoksa plan yine çizilir", () => {
    // Servis kullanılamayan koltukları listeye hiç koymaz; plan bu
    // konumlarda boşluk bırakır.
    const seats = FIVE_BY_EIGHT.filter((seat) => seat.id !== A2);

    render(
      <SeatMap
        seats={seats}
        seatStatuses={{}}
        selectedSeats={[]}
        onSeatSelect={vi.fn()}
      />
    );

    expect(screen.getAllByRole("button")).toHaveLength(39);
    expect(
      screen.queryByRole("button", { name: /^A2 numaralı koltuk/ })
    ).not.toBeInTheDocument();
  });

  it("koltuk listesi boşsa açıklayıcı bir panel gösterir", () => {
    render(
      <SeatMap
        seats={[]}
        seatStatuses={{}}
        selectedSeats={[]}
        onSeatSelect={vi.fn()}
      />
    );

    expect(
      screen.getByText("Bu seans için koltuk planı bulunamadı.")
    ).toBeInTheDocument();
  });

  it("servisten gelen durumu doğru şekilde çözer: DOLU/GECICI_KILITLI yerel seçime üstün gelir", () => {
    render(
      <SeatMap
        seats={FIVE_BY_EIGHT}
        seatStatuses={{
          [A1]: SEAT_STATUS.DOLU,
          [A2]: SEAT_STATUS.GECICI_KILITLI,
        }}
        selectedSeats={[A1, A2, A3]}
        onSeatSelect={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /A1 numaralı koltuk, Dolu/ })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", {
        name: /A2 numaralı koltuk, Geçici kilitli/,
      })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /A3 numaralı koltuk, Seçili/ })
    ).toBeEnabled();
  });

  it("GECICI_KILITLI ve DOLU koltuklarda tıklama seçim çağırmaz, BOS'ta çağırır", () => {
    const handleSeatSelect = vi.fn();

    render(
      <SeatMap
        seats={FIVE_BY_EIGHT}
        seatStatuses={{
          [A1]: SEAT_STATUS.DOLU,
          [A2]: SEAT_STATUS.GECICI_KILITLI,
        }}
        selectedSeats={[]}
        onSeatSelect={handleSeatSelect}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /^A1 numaralı koltuk/ })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /^A2 numaralı koltuk/ })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /^A3 numaralı koltuk/ })
    );

    // Seçim, etiketle değil backend koltuk kimliğiyle bildirilir.
    expect(handleSeatSelect).toHaveBeenCalledTimes(1);
    expect(handleSeatSelect).toHaveBeenCalledWith(A3);
  });

  it("dört durumu da içeren bir gösterge (legend) render eder", () => {
    render(
      <SeatMap
        seats={FIVE_BY_EIGHT}
        seatStatuses={{}}
        selectedSeats={[]}
        onSeatSelect={vi.fn()}
      />
    );

    expect(screen.getByText("Boş")).toBeInTheDocument();
    expect(screen.getByText("Seçili")).toBeInTheDocument();
    expect(screen.getByText("Geçici kilitli")).toBeInTheDocument();
    expect(screen.getByText("Dolu")).toBeInTheDocument();
  });
});
