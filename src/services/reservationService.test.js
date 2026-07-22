import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { TICKET_TYPE } from "../domain/ticketType.js";
import reservationService from "./reservationService.js";

function createCartItem({
  sessionId = 999,
  seats = [
    {
      seatId: "A1",
      ticketType: TICKET_TYPE.ADULT,
    },
    {
      seatId: "A2",
      ticketType: TICKET_TYPE.STUDENT,
    },
  ],
  unitPrice = 220,
} = {}) {
  return {
    id: `session-${sessionId}`,
    sessionId,
    movieId: 1,
    movieTitle: "Neon Yağmuru",
    date: "13 Temmuz",
    time: "13:30",
    hallName: "Salon 1",
    seats,
    unitPrice,
  };
}

describe("reservationService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("koltukları ayırır ve doğru rezervasyon toplamını kaydeder", async () => {
    const reservationPromise =
      reservationService.createReservation([
        createCartItem(),
      ]);

    await vi.runAllTimersAsync();

    const reservation = await reservationPromise;
    const reservedSeats = JSON.parse(
      localStorage.getItem("reserved-seats-999")
    );
    const storedReservations = JSON.parse(
      localStorage.getItem("cineseat-reservations")
    );

    expect(reservation).toMatchObject({
      ticketCount: 2,
      totalPrice: 346.5,
    });
    expect(reservation.id).toMatch(/^RES-\d{5}$/);
    expect(reservedSeats).toEqual(["A1", "A2"]);
    expect(reservation.items[0].seats).toEqual([
      {
        seatId: "A1",
        ticketType: TICKET_TYPE.ADULT,
      },
      {
        seatId: "A2",
        ticketType: TICKET_TYPE.STUDENT,
      },
    ]);
    expect(storedReservations).toEqual([reservation]);
  });

  it("önceden ayrılmış bir koltuk için rezervasyonu reddeder", async () => {
    localStorage.setItem(
      "reserved-seats-999",
      JSON.stringify(["A1"])
    );

    const reservationPromise =
      reservationService.createReservation([
        createCartItem({
          seats: [
            {
              seatId: "A1",
              ticketType: TICKET_TYPE.ADULT,
            },
          ],
        }),
      ]);
    const rejection = expect(
      reservationPromise
    ).rejects.toThrow(
      "A1 koltukları artık müsait değil"
    );

    await vi.runAllTimersAsync();
    await rejection;

    expect(
      localStorage.getItem("cineseat-reservations")
    ).toBeNull();
  });

  it("testler arasında localStorage verisi taşımaz", () => {
    expect(localStorage.length).toBe(0);
  });
});
