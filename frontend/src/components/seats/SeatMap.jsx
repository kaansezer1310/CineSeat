import {
  SEAT_STATUS,
  SEAT_STATUS_LIST,
  getSeatStatusLabel,
  resolveDisplaySeatStatus,
} from "../../domain/seatStatus.js";
import Seat from "./Seat.jsx";

const SEAT_LEGEND_CLASS_NAMES = {
  [SEAT_STATUS.BOS]: "seat-status-bos",
  [SEAT_STATUS.SECILI]: "seat-status-secili",
  [SEAT_STATUS.GECICI_KILITLI]: "seat-status-gecici-kilitli",
  [SEAT_STATUS.DOLU]: "seat-status-dolu",
};

/**
 * Koltuk planı.
 *
 * Koltuklar artık `totalSeats`tan türetilmiyor; salonun gerçek koltuk
 * listesinden geliyor. Her koltuk kendi (satır, sütun) konumuna
 * yerleştirildiği için devre dışı/eksik koltuklar planda doğal bir boşluk
 * bırakır — düzgün bir dikdörtgen varsayımı yok.
 *
 * seats: [{ id, label, row, column }]
 */
function SeatMap({ seats = [], seatStatuses, selectedSeats, onSeatSelect }) {
  const columnCount = seats.reduce(
    (max, seat) => Math.max(max, seat.column ?? 0),
    0
  );

  if (seats.length === 0) {
    return (
      <div className="seat-map-section">
        <div className="temporary-panel">
          Bu seans için koltuk planı bulunamadı.
        </div>
      </div>
    );
  }

  return (
    <div className="seat-map-section">
      <div className="cinema-screen">
        <span>PERDE</span>
      </div>

      {/* Sütun sayısı veriden gelir; düzen kuralının kendisi CSS'te durur
          (bkz. App.css `.seat-map`), JSX yalnızca değeri geçirir. */}
      <div
        className="seat-map"
        style={{ "--seat-columns": columnCount || 1 }}
      >
        {seats.map((seat) => {
          const storedStatus =
            seatStatuses[seat.id] ?? SEAT_STATUS.BOS;

          const isSelectedLocally = selectedSeats.includes(seat.id);

          const status = resolveDisplaySeatStatus(
            storedStatus,
            isSelectedLocally
          );

          return (
            <Seat
              key={seat.id}
              seatId={seat.id}
              label={seat.label}
              row={seat.row}
              column={seat.column}
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
