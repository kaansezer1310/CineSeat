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

function SeatMap({
  totalSeats,
  reservedSeats,
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
          const isReserved =
            reservedSeats.includes(seatId);

          const isSelected =
            selectedSeats.includes(seatId);

          return (
            <Seat
              key={seatId}
              seatId={seatId}
              isReserved={isReserved}
              isSelected={isSelected}
              onSelect={onSeatSelect}
            />
          );
        })}
      </div>

      <div className="seat-legend">
        <div>
          <span className="legend-seat seat-available" />
          Boş
        </div>

        <div>
          <span className="legend-seat seat-selected" />
          Seçili
        </div>

        <div>
          <span className="legend-seat seat-reserved" />
          Dolu
        </div>
      </div>
    </div>
  );
}

export default SeatMap;