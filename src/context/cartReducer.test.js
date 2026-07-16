import {
  describe,
  expect,
  it,
} from "vitest";

import { TICKET_TYPE } from "../domain/ticketType.js";
import {
  cartReducer,
  initialCartState,
} from "./cartReducer.js";

function createSeat(
  seatId,
  ticketType = TICKET_TYPE.ADULT
) {
  return {
    seatId,
    ticketType,
  };
}

function createTicket({
  id = "session-101",
  sessionId = 101,
  seats = [createSeat("A1")],
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
  it("koltuğu { seatId, ticketType } nesnesi olarak ekler", () => {
    const ticket = createTicket({
      seats: [
        createSeat("A1", TICKET_TYPE.STUDENT),
      ],
    });

    const state = cartReducer(initialCartState, {
      type: "ADD_TICKET",
      payload: ticket,
    });

    expect(state.items).toHaveLength(1);
    expect(state.items[0].seats).toEqual([
      {
        seatId: "A1",
        ticketType: TICKET_TYPE.STUDENT,
      },
    ]);
  });

  it("aynı seansta farklı bilet tiplerini bir arada tutar", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_TICKET",
      payload: createTicket({
        seats: [
          createSeat("A1", TICKET_TYPE.ADULT),
          createSeat("A2", TICKET_TYPE.STUDENT),
          createSeat("A3", TICKET_TYPE.CHILD),
        ],
      }),
    });

    expect(state.items[0].seats).toEqual([
      createSeat("A1", TICKET_TYPE.ADULT),
      createSeat("A2", TICKET_TYPE.STUDENT),
      createSeat("A3", TICKET_TYPE.CHILD),
    ]);
  });

  it("aynı seansın koltuklarını birleştirip seatId ile tekrarları kaldırır", () => {
    const firstSeatObject = createSeat(
      "A2",
      TICKET_TYPE.ADULT
    );
    const duplicateSeatObject = {
      seatId: "A2",
      ticketType: TICKET_TYPE.STUDENT,
    };

    const initialState = {
      items: [
        createTicket({
          seats: [
            createSeat("A1", TICKET_TYPE.ADULT),
            firstSeatObject,
          ],
        }),
      ],
    };

    const state = cartReducer(initialState, {
      type: "ADD_TICKET",
      payload: createTicket({
        seats: [
          duplicateSeatObject,
          createSeat("A3", TICKET_TYPE.CHILD),
          createSeat("A3", TICKET_TYPE.CHILD),
        ],
      }),
    });

    expect(state.items).toHaveLength(1);
    expect(state.items[0].seats).toEqual([
      createSeat("A1", TICKET_TYPE.ADULT),
      createSeat("A2", TICKET_TYPE.STUDENT),
      createSeat("A3", TICKET_TYPE.CHILD),
    ]);
    expect(firstSeatObject.ticketType).toBe(
      TICKET_TYPE.ADULT
    );
  });

  it("nesne kimliği farklı olsa bile aynı seatId'yi yinelemez", () => {
    const initialState = {
      items: [
        createTicket({
          seats: [createSeat("A1", TICKET_TYPE.ADULT)],
        }),
      ],
    };

    const state = cartReducer(initialState, {
      type: "ADD_TICKET",
      payload: createTicket({
        seats: [
          {
            seatId: "A1",
            ticketType: TICKET_TYPE.CHILD,
          },
        ],
      }),
    });

    expect(state.items[0].seats).toHaveLength(1);
    expect(state.items[0].seats[0]).toEqual({
      seatId: "A1",
      ticketType: TICKET_TYPE.CHILD,
    });
  });

  it("farklı seanslarda aynı koltuk etiketine izin verir", () => {
    const firstTicket = createTicket({
      seats: [createSeat("A1", TICKET_TYPE.ADULT)],
    });
    const secondTicket = createTicket({
      id: "session-201",
      sessionId: 201,
      seats: [createSeat("A1", TICKET_TYPE.STUDENT)],
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

    expect(state.items).toHaveLength(2);
    expect(state.items[0].seats[0]).toEqual(
      createSeat("A1", TICKET_TYPE.ADULT)
    );
    expect(state.items[1].seats[0]).toEqual(
      createSeat("A1", TICKET_TYPE.STUDENT)
    );
  });

  it("UPDATE_TICKET_TYPE yalnızca hedef koltuğun tipini değiştirir", () => {
    const otherSessionTicket = createTicket({
      id: "session-201",
      sessionId: 201,
      seats: [createSeat("A1", TICKET_TYPE.ADULT)],
    });
    const initialState = {
      items: [
        createTicket({
          seats: [
            createSeat("A1", TICKET_TYPE.ADULT),
            createSeat("A2", TICKET_TYPE.STUDENT),
          ],
        }),
        otherSessionTicket,
      ],
    };

    const state = cartReducer(initialState, {
      type: "UPDATE_TICKET_TYPE",
      payload: {
        sessionId: 101,
        seatId: "A1",
        ticketType: TICKET_TYPE.CHILD,
      },
    });

    expect(state.items[0].seats).toEqual([
      createSeat("A1", TICKET_TYPE.CHILD),
      createSeat("A2", TICKET_TYPE.STUDENT),
    ]);
    expect(state.items[1]).toBe(otherSessionTicket);
    expect(initialState.items[0].seats[0].ticketType).toBe(
      TICKET_TYPE.ADULT
    );
  });

  it("geçersiz bilet tipini sepete almaz", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_TICKET",
      payload: createTicket({
        seats: [
          {
            seatId: "A1",
            ticketType: "Yetişkin",
          },
          createSeat("A2", TICKET_TYPE.STUDENT),
        ],
      }),
    });

    expect(state.items[0].seats).toEqual([
      createSeat("A2", TICKET_TYPE.STUDENT),
    ]);
  });

  it("tüm koltuklar geçersizse state'i değiştirmez", () => {
    const state = cartReducer(initialCartState, {
      type: "ADD_TICKET",
      payload: createTicket({
        seats: [
          {
            seatId: "A1",
            ticketType: "invalid",
          },
        ],
      }),
    });

    expect(state).toBe(initialCartState);
  });

  it("geçersiz UPDATE_TICKET_TYPE payload'ında state'i korur", () => {
    const initialState = {
      items: [
        createTicket({
          seats: [createSeat("A1", TICKET_TYPE.ADULT)],
        }),
      ],
    };

    const state = cartReducer(initialState, {
      type: "UPDATE_TICKET_TYPE",
      payload: {
        sessionId: 101,
        seatId: "A1",
        ticketType: "Yetişkin",
      },
    });

    expect(state).toBe(initialState);
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

  it("bilinmeyen action için mevcut state'i döndürür", () => {
    const initialState = {
      items: [createTicket()],
    };

    const state = cartReducer(initialState, {
      type: "UNKNOWN_ACTION",
    });

    expect(state).toBe(initialState);
  });

  it("ADD_TICKET orijinal state ve iç içe dizileri mutasyona uğratmaz", () => {
    const originalSeats = [
      createSeat("A1", TICKET_TYPE.ADULT),
    ];
    const initialState = {
      items: [
        createTicket({
          seats: originalSeats,
        }),
      ],
    };

    const state = cartReducer(initialState, {
      type: "ADD_TICKET",
      payload: createTicket({
        seats: [createSeat("A2", TICKET_TYPE.CHILD)],
      }),
    });

    expect(originalSeats).toEqual([
      createSeat("A1", TICKET_TYPE.ADULT),
    ]);
    expect(initialState.items[0].seats).toBe(originalSeats);
    expect(state.items[0].seats).not.toBe(originalSeats);
    expect(state.items[0].seats).toEqual([
      createSeat("A1", TICKET_TYPE.ADULT),
      createSeat("A2", TICKET_TYPE.CHILD),
    ]);
  });
});
