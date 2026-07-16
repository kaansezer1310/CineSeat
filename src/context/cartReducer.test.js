import {
  describe,
  expect,
  it,
} from "vitest";

import {
  cartReducer,
  initialCartState,
} from "./cartReducer.js";

function createTicket({
  id = "session-101",
  sessionId = 101,
  seats = ["A1"],
} = {}) {
  return {
    id,
    sessionId,
    movieId: 1,
    movieTitle: "Neon Yağmuru",
    date: "13 Temmuz",
    time: "13:30",
    hallName: "Salon 1",
    seats,
    unitPrice: 220,
  };
}

describe("cartReducer", () => {
  it("yeni bir seans bileti ekler", () => {
    const ticket = createTicket();

    const state = cartReducer(initialCartState, {
      type: "ADD_TICKET",
      payload: ticket,
    });

    expect(state.items).toEqual([ticket]);
  });

  it("aynı seansın koltuklarını birleştirip tekrarları kaldırır", () => {
    const initialState = {
      items: [
        createTicket({
          seats: ["A1", "A2"],
        }),
      ],
    };

    const state = cartReducer(initialState, {
      type: "ADD_TICKET",
      payload: createTicket({
        seats: ["A2", "A3", "A3"],
      }),
    });

    expect(state.items).toHaveLength(1);
    expect(state.items[0].seats).toEqual([
      "A1",
      "A2",
      "A3",
    ]);
  });

  it("farklı seansları ayrı öğeler olarak korur", () => {
    const firstTicket = createTicket();
    const secondTicket = createTicket({
      id: "session-201",
      sessionId: 201,
      seats: ["B1"],
    });

    const state = cartReducer(
      {
        items: [firstTicket],
      },
      {
        type: "ADD_TICKET",
        payload: secondTicket,
      }
    );

    expect(state.items).toEqual([
      firstTicket,
      secondTicket,
    ]);
  });

  it("bir sepet öğesini kaldırır", () => {
    const firstTicket = createTicket();
    const secondTicket = createTicket({
      id: "session-201",
      sessionId: 201,
    });

    const state = cartReducer(
      {
        items: [firstTicket, secondTicket],
      },
      {
        type: "REMOVE_TICKET",
        payload: firstTicket.id,
      }
    );

    expect(state.items).toEqual([secondTicket]);
  });

  it("sepeti temizler", () => {
    const state = cartReducer(
      {
        items: [createTicket()],
      },
      {
        type: "CLEAR_CART",
      }
    );

    expect(state).toEqual(initialCartState);
  });
});
