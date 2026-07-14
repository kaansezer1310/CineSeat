const initialReservedSeats = {
  101: ["A2", "A3", "B5", "C1", "D7"],
  102: ["A1", "A8", "B2", "B3", "C6"],
  103: ["A4", "B4", "C4", "D4", "E4"],

  201: ["A1", "A2", "B6", "C7", "D3", "E5"],
  202: ["A5", "B5", "C5", "D5", "E5"],
  203: ["A7", "B1", "C3", "D6"],

  301: ["A3", "A4", "B1", "C8"],
  302: ["A2", "B2", "C2", "D2"],
  303: ["A6", "B7", "C4", "E8"],

  401: ["A1", "A8", "B4", "C5"],
  402: ["A3", "B3", "C3", "D3"],
  403: ["A2", "A7", "B5", "D6"],
};

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function getReservedSeatsBySessionId(sessionId) {
  await wait(400);

  const storageKey = `reserved-seats-${sessionId}`;

  const savedSeats = localStorage.getItem(storageKey);

  if (savedSeats) {
    return JSON.parse(savedSeats);
  }

  return initialReservedSeats[sessionId] ?? [];
}

async function reserveSeats({ sessionId, seats }) {
  await wait(500);

  const storageKey = `reserved-seats-${sessionId}`;

  const currentReservedSeats =
    await getReservedSeatsBySessionId(sessionId);

  const hasConflict = seats.some((seat) => {
    return currentReservedSeats.includes(seat);
  });

  if (hasConflict) {
    throw new Error(
      "Seçtiğin koltuklardan biri başka bir kullanıcı tarafından alınmış."
    );
  }

  const updatedReservedSeats = [
    ...currentReservedSeats,
    ...seats,
  ];

  localStorage.setItem(
    storageKey,
    JSON.stringify(updatedReservedSeats)
  );

  return updatedReservedSeats;
}

const seatService = {
  getReservedSeatsBySessionId,
  reserveSeats,
};

export default seatService;