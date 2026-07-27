import {
  SEAT_STATUS,
  SEAT_STATUS_LIST,
  getSeatStatusLabel,
  resolveDisplaySeatStatus,
} from "../../domain/seatStatus.js";
import Seat from "./Seat.jsx";

function createSeatIds(totalSeats) {
  const seatsPerRow = totalSeats === 60 ? 10 : 8;
  const rowCount = Math.ceil(totalSeats / seatsPerRow);

  const seatIds = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowLetter = String.fromCharCode(65 + rowIndex);

    for (
      let seatNumber = 1;
      seatNumber <= seatsPerRow;
      seatNumber += 1
    ) {
      const seatId = `${rowLetter}${seatNumber}`;

      seatIds.push(seatId);
    }
  }

  return {
    seatIds,
    seatsPerRow,
  };
}

const SEAT_LEGEND_CLASS_NAMES = {
  [SEAT_STATUS.BOS]: "seat-status-bos",
  [SEAT_STATUS.SECILI]: "seat-status-secili",
  [SEAT_STATUS.GECICI_KILITLI]: "seat-status-gecici-kilitli",
  [SEAT_STATUS.DOLU]: "seat-status-dolu",
};

function SeatMap({
  totalSeats,
  seatStatuses,
  selectedSeats,
  onSeatSelect,
}) {
  const { seatIds, seatsPerRow } =
    createSeatIds(totalSeats);

  return (
    <div className="seat-map-section">
      <div className="cinema-screen">
        <span>PERDE</span>
      </div>

      <div
        className="seat-map"
        style={{
          gridTemplateColumns: `repeat(${seatsPerRow}, minmax(0, 1fr))`,
        }}
      >
        {seatIds.map((seatId) => {
          const storedStatus =
            seatStatuses[seatId] ?? SEAT_STATUS.BOS;

          const isSelectedLocally =
            selectedSeats.includes(seatId);

          const status = resolveDisplaySeatStatus(
            storedStatus,
            isSelectedLocally
          );

          return (
            <Seat
              key={seatId}
              seatId={seatId}
              status={status}
              onSelect={onSeatSelect}
            />
          );
        })}
      </div>

      <div className="seat-legend">
        {SEAT_STATUS_LIST.map((status) => {
          return (
            <div key={status}>
              <span
                className={`legend-seat ${SEAT_LEGEND_CLASS_NAMES[status]}`}
              />
              {getSeatStatusLabel(status)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SeatMap;
