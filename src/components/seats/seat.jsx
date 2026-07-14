function Seat({
  seatId,
  isSelected,
  isReserved,
  onSelect,
}) {
  function handleClick() {
    if (isReserved) {
      return;
    }

    onSelect(seatId);
  }

  let seatClassName = "seat";

  if (isReserved) {
    seatClassName += " seat-reserved";
  } else if (isSelected) {
    seatClassName += " seat-selected";
  }

  return (
    <button
      className={seatClassName}
      type="button"
      onClick={handleClick}
      disabled={isReserved}
      aria-label={`${seatId} numaralı koltuk`}
      title={
        isReserved
          ? `${seatId} dolu`
          : `${seatId} koltuğunu seç`
      }
    >
      {seatId}
    </button>
  );
}

export default Seat;