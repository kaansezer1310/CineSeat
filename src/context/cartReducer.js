import {
  isValidTicketType,
  normalizeTicketType,
} from "../domain/ticketType.js";

export const initialCartState = {
  items: [],
};

function normalizeCartSeat(seat) {
  if (
    seat !== null &&
    typeof seat === "object" &&
    typeof seat.seatId === "string" &&
    seat.seatId.trim().length > 0
  ) {
    const ticketType = normalizeTicketType(seat.ticketType);

    if (!ticketType) {
      return null;
    }

    return {
      seatId: seat.seatId.trim(),
      ticketType,
    };
  }

  return null;
}

function normalizeCartSeats(seats) {
  if (!Array.isArray(seats)) {
    return [];
  }

  const seatsById = new Map();

  seats.forEach((seat) => {
    const normalizedSeat = normalizeCartSeat(seat);

    if (!normalizedSeat) {
      return;
    }

    // Aynı seatId birden fazla gelirse son geçerli ticketType kazanır;
    // Set(object) kullanılamaz çünkü nesne kimliğiyle dedupe yapar.
    seatsById.set(normalizedSeat.seatId, normalizedSeat);
  });

  return [...seatsById.values()];
}

function mergeSessionSeats(existingSeats, incomingSeats) {
  const seatsById = new Map();

  existingSeats.forEach((seat) => {
    seatsById.set(seat.seatId, seat);
  });

  incomingSeats.forEach((seat) => {
    seatsById.set(seat.seatId, seat);
  });

  return [...seatsById.values()];
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TICKET": {
      const newTicket = action.payload;

      if (
        newTicket === null ||
        typeof newTicket !== "object" ||
        newTicket.sessionId === undefined ||
        newTicket.sessionId === null
      ) {
        return state;
      }

      const normalizedSeats = normalizeCartSeats(
        newTicket.seats
      );

      if (normalizedSeats.length === 0) {
        return state;
      }

      const ticketToAdd = {
        ...newTicket,
        seats: normalizedSeats,
      };

      const existingItem = state.items.find((item) => {
        return item.sessionId === ticketToAdd.sessionId;
      });

      if (!existingItem) {
        return {
          ...state,
          items: [...state.items, ticketToAdd],
        };
      }

      const mergedSeats = mergeSessionSeats(
        existingItem.seats,
        ticketToAdd.seats
      );

      const updatedItems = state.items.map((item) => {
        if (item.sessionId === ticketToAdd.sessionId) {
          return {
            ...item,
            seats: mergedSeats,
          };
        }

        return item;
      });

      return {
        ...state,
        items: updatedItems,
      };
    }

    case "UPDATE_TICKET_TYPE": {
      const payload = action.payload;

      if (
        payload === null ||
        typeof payload !== "object" ||
        payload.sessionId === undefined ||
        payload.sessionId === null ||
        typeof payload.seatId !== "string" ||
        payload.seatId.trim().length === 0 ||
        !isValidTicketType(payload.ticketType)
      ) {
        return state;
      }

      const targetSeatId = payload.seatId.trim();
      let didUpdate = false;

      const updatedItems = state.items.map((item) => {
        if (item.sessionId !== payload.sessionId) {
          return item;
        }

        let seatChanged = false;

        const updatedSeats = item.seats.map((seat) => {
          if (seat.seatId !== targetSeatId) {
            return seat;
          }

          if (seat.ticketType === payload.ticketType) {
            return seat;
          }

          seatChanged = true;

          return {
            ...seat,
            ticketType: payload.ticketType,
          };
        });

        if (!seatChanged) {
          return item;
        }

        didUpdate = true;

        return {
          ...item,
          seats: updatedSeats,
        };
      });

      if (!didUpdate) {
        return state;
      }

      return {
        ...state,
        items: updatedItems,
      };
    }

    case "REMOVE_TICKET": {
      const itemId = action.payload;

      return {
        ...state,
        items: state.items.filter((item) => {
          return item.id !== itemId;
        }),
      };
    }

    case "CLEAR_CART": {
      return {
        ...state,
        items: [],
      };
    }

    default: {
      return state;
    }
  }
}
