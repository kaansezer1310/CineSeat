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

// `seatId` backend'in gerçek koltuk kimliği (sayı); `label` ise ekranda
// gösterilen "A5" biçimi. Seçim, kilit ve rezervasyon her zaman id ile
// yapılır — etiket yalnızca görüntülemedir.
function Seat({ seatId, label, row, column, status, onSelect }) {
  const isSelectable = isSeatSelectable(status);
  const statusLabel = getSeatStatusLabel(status);
  const displayLabel = label ?? String(seatId);

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
      aria-label={`${displayLabel} numaralı koltuk, ${statusLabel}`}
      title={`${displayLabel} — ${statusLabel}`}
      style={
        row && column
          ? { "--seat-row": row, "--seat-column": column }
          : undefined
      }
    >
      {displayLabel}
    </button>
  );
}

export default Seat;
