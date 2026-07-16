import seatService from "./seatService.js";

const RESERVATIONS_STORAGE_KEY = "cineseat-reservations";

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function createReservationId() {
  return `CS-${Date.now()}`;
}

function getStoredReservations() {
  const savedReservations = localStorage.getItem(
    RESERVATIONS_STORAGE_KEY
  );

  if (!savedReservations) {
    return [];
  }

  try {
    const parsedReservations = JSON.parse(
      savedReservations
    );

    return Array.isArray(parsedReservations)
      ? parsedReservations
      : [];
  } catch {
    return [];
  }
}

// seatService düz koltuk kimliği listesi bekler; sepet ise
// { seatId, ticketType } nesneleri taşır. Sınırda dönüştürülür.
function getSeatIdsFromCartSeats(seats) {
  if (!Array.isArray(seats)) {
    return [];
  }

  return seats
    .map((seat) => {
      if (
        seat !== null &&
        typeof seat === "object" &&
        typeof seat.seatId === "string"
      ) {
        return seat.seatId;
      }

      return null;
    })
    .filter((seatId) => {
      return typeof seatId === "string" && seatId.length > 0;
    });
}

function cloneCartSeats(seats) {
  if (!Array.isArray(seats)) {
    return [];
  }

  return seats.map((seat) => {
    return {
      seatId: seat.seatId,
      ticketType: seat.ticketType,
    };
  });
}

async function createReservation(cartItems) {
  await wait(600);

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error(
      "Rezervasyon oluşturmak için sepette bilet bulunmalıdır."
    );
  }

  const seatChecks = await Promise.all(
    cartItems.map(async (item) => {
      const reservedSeats =
        await seatService.getReservedSeatsBySessionId(
          item.sessionId
        );

      const seatIds = getSeatIdsFromCartSeats(item.seats);

      const conflictingSeats = seatIds.filter(
        (seatId) => {
          return reservedSeats.includes(seatId);
        }
      );

      return {
        sessionId: item.sessionId,
        movieTitle: item.movieTitle,
        seatIds,
        conflictingSeats,
      };
    })
  );

  const conflictingSession = seatChecks.find(
    (seatCheck) => {
      return seatCheck.conflictingSeats.length > 0;
    }
  );

  if (conflictingSession) {
    throw new Error(
      `${conflictingSession.movieTitle} seansındaki ` +
        `${conflictingSession.conflictingSeats.join(", ")} ` +
        "koltukları artık müsait değil. Sepetten kaldırıp tekrar seçim yapmalısın."
    );
  }

  await Promise.all(
    cartItems.map((item, index) => {
      return seatService.reserveSeats({
        sessionId: item.sessionId,
        seats: seatChecks[index].seatIds,
      });
    })
  );

  const ticketCount = cartItems.reduce(
    (total, item) => {
      return total + item.seats.length;
    },
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) => {
      const itemTotal =
        item.seats.length * item.unitPrice;

      return total + itemTotal;
    },
    0
  );

  const reservation = {
    id: createReservationId(),
    createdAt: new Date().toISOString(),
    ticketCount,
    totalPrice,

    items: cartItems.map((item) => {
      return {
        ...item,
        seats: cloneCartSeats(item.seats),
      };
    }),
  };

  const storedReservations = getStoredReservations();

  const updatedReservations = [
    ...storedReservations,
    reservation,
  ];

  localStorage.setItem(
    RESERVATIONS_STORAGE_KEY,
    JSON.stringify(updatedReservations)
  );

  return reservation;
}

const reservationService = {
  createReservation,
};

export default reservationService;
