import {
  SEAT_STATUS,
  getSeatStatusLabel,
  isSeatSelectable,
} from "../../domain/seatStatus.js";

const SEAT_STATUS_CLASS_NAMES = {
  [SEAT_STATUS.BOS]: "seat-status-bos",
  [SEAT_STATUS.SECILI]: "seat-status-secili",
  [SEAT_STATUS.GECICI_KILITLI]: "seat-status-gecici-kilitli",
  [SEAT_STATUS.DOLU]: "seat-status-dolu",
};

// Koltuk, tek ve açık bir `status` prop'una göre render edilir (bkz.
// `src/domain/seatStatus.js`). Servis/storage erişimi yoktur; yalnızca
// aldığı durumu görsel ve erişilebilir şekilde sunan sunum (presentational)
// bileşenidir.
function Seat({ seatId, status, onSelect }) {
  const isSelectable = isSeatSelectable(status);
  const statusLabel = getSeatStatusLabel(status);

  function handleClick() {
    if (!isSelectable) {
      return;
    }

    onSelect(seatId);
  }

  const seatClassName = [
    "seat",
    SEAT_STATUS_CLASS_NAMES[status] ??
      SEAT_STATUS_CLASS_NAMES[SEAT_STATUS.BOS],
  ].join(" ");

  return (
    <button
      className={seatClassName}
      type="button"
      onClick={handleClick}
      disabled={!isSelectable}
      aria-pressed={
        isSelectable
          ? status === SEAT_STATUS.SECILI
          : undefined
      }
      aria-label={`${seatId} numaralı koltuk, ${statusLabel}`}
      title={`${seatId} — ${statusLabel}`}
    >
      {seatId}
    </button>
  );
}

export default Seat;
