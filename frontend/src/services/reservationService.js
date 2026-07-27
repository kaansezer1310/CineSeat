import seatService from "./seatService.js";
import { calcSubtotal } from "./pricing.js";
import campaignService from "./campaignService.js";

const RESERVATIONS_STORAGE_KEY = "cineseat-reservations";

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function createReservationId() {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `RES-${randomNum}`;
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

async function createReservation(payload) {
  await wait(600);

  // Eskiden cartItems doğrudan geliyordu, simdi payload obje olarak geliyor
  const cartItems = payload.cartItems ? payload.cartItems : payload;
  const visitorInfo = payload.visitorInfo || null;
  const lockToken = payload.lockToken || null;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error(
      "Rezervasyon oluşturmak için sepette bilet bulunmalıdır."
    );
  }

  // Atomik kontrol ve yazım işlemi için tüm oturum/koltuk çiftlerini hazırla
  const sessionSeatPairs = cartItems.map((item) => ({
    sessionId: item.sessionId,
    seats: getSeatIdsFromCartSeats(item.seats),
  }));

  // Bu işlem artık atomiktir
  await seatService.reserveAllSeats(sessionSeatPairs, lockToken);

  const ticketCount = cartItems.reduce(
    (total, item) => {
      return total + item.seats.length;
    },
    0
  );

  const subtotal = calcSubtotal(cartItems);
  const { discountAmount } = campaignService.getCampaignDiscount(subtotal, !visitorInfo ? { role: 'member' } : null);
  const totalPrice = subtotal - discountAmount;

  const reservation = {
    id: createReservationId(),
    createdAt: new Date().toISOString(),
    ticketCount,
    totalPrice,
    visitorInfo,

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

async function getAllReservations() {
  await wait(300);

  return getStoredReservations();
}

const reservationService = {
  createReservation,
  getAllReservations,
};

export default reservationService;
