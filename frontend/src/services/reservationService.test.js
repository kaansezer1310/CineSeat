import { beforeEach, describe, expect, it, vi } from "vitest";

import { TICKET_TYPE } from "../domain/ticketType.js";
import { ConflictError } from "./errors.js";

vi.mock("./apiClient.js", () => {
  const client = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  };

  return { default: client, apiClient: client };
});

const { default: apiClient } = await import("./apiClient.js");
const { default: reservationService } = await import(
  "./reservationService.js"
);

const BUYER = {
  firstName: "Ömer",
  lastName: "Faruk",
  email: "omer@cineseat.com",
};

function cartItem(overrides = {}) {
  return {
    sessionId: 7,
    seats: [
      { seatId: 11, ticketType: TICKET_TYPE.ADULT },
      { seatId: 12, ticketType: TICKET_TYPE.STUDENT },
    ],
    ...overrides,
  };
}

function reservationDto(overrides = {}) {
  return {
    id: 1,
    resNo: "RES-001",
    showtimeId: 7,
    campaignId: null,
    buyerFname: "Ömer",
    buyerLname: "Faruk",
    buyerEmail: "omer@cineseat.com",
    subtotal: 400,
    discount: 40,
    total: 360,
    status: "Completed",
    tickets: [
      { id: 1, seatId: 11, ticketType: "Adult", price: 220 },
      { id: 2, seatId: 12, ticketType: "Student", price: 180 },
    ],
    ...overrides,
  };
}

describe("reservationService.createReservation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("her kaleme KENDİ kampanyasını gönderir", async () => {
    apiClient.post.mockResolvedValue(reservationDto());

    await reservationService.createReservation({
      cartItems: [
        cartItem({ sessionId: 7, campaignId: 3 }),
        cartItem({ sessionId: 8, campaignId: null }),
      ],
      buyer: BUYER,
    });

    // Tum sepete tek kampanya gecirmek, esigi sepet toplaminda asan ama
    // kalem bazinda asmayan durumlarda backend'den 409 aldiriyordu.
    expect(apiClient.post.mock.calls[0][1]).toMatchObject({
      showtimeId: 7,
      campaignId: 3,
    });
    expect(apiClient.post.mock.calls[1][1]).toMatchObject({
      showtimeId: 8,
      campaignId: null,
    });
  });

  it("kampanya verilmemiş kaleme null gönderir", async () => {
    apiClient.post.mockResolvedValue(reservationDto());

    await reservationService.createReservation({
      cartItems: [cartItem()],
      buyer: BUYER,
    });

    expect(apiClient.post.mock.calls[0][1].campaignId).toBeNull();
  });

  it("bilet tipini backend adlandırmasına çevirir ve toplam GÖNDERMEZ", async () => {
    apiClient.post.mockResolvedValue(reservationDto());

    await reservationService.createReservation({
      // Kampanya artik KALEM uzerinde: backend her seans icin ayri rezervasyon
      // olusturuyor ve kosullari o rezervasyonun ara toplamina gore dogruluyor.
      cartItems: [cartItem({ campaignId: 3 })],
      buyer: BUYER,
    });

    expect(apiClient.post).toHaveBeenCalledWith("/reservations", {
      showtimeId: 7,
      campaignId: 3,
      buyerFname: "Ömer",
      buyerLname: "Faruk",
      buyerEmail: "omer@cineseat.com",
      seats: [
        { seatId: 11, ticketType: "Adult" },
        { seatId: 12, ticketType: "Student" },
      ],
    });

    // Tutar istemciden gelmemeli; hesabı backend yapar.
    const [, body] = apiClient.post.mock.calls[0];
    expect(body).not.toHaveProperty("total");
    expect(body).not.toHaveProperty("subtotal");
  });

  it("sepetteki her seans için ayrı rezervasyon oluşturur", async () => {
    apiClient.post
      .mockResolvedValueOnce(reservationDto({ id: 1, resNo: "RES-001" }))
      .mockResolvedValueOnce(
        reservationDto({ id: 2, resNo: "RES-002", showtimeId: 9 })
      );

    const created = await reservationService.createReservation({
      cartItems: [cartItem(), cartItem({ sessionId: 9 })],
      buyer: BUYER,
    });

    expect(created).toHaveLength(2);
    expect(created.map((item) => item.resNo)).toEqual([
      "RES-001",
      "RES-002",
    ]);
  });

  it("backend cevabını arayüzün kullandığı şekle çevirir", async () => {
    apiClient.post.mockResolvedValue(reservationDto());

    const [reservation] = await reservationService.createReservation({
      cartItems: [cartItem()],
      buyer: BUYER,
    });

    expect(reservation.total).toBe(360);
    expect(reservation.discount).toBe(40);
    expect(reservation.tickets[1].ticketType).toBe(TICKET_TYPE.STUDENT);
    expect(reservation.buyer.email).toBe("omer@cineseat.com");
  });

  it("araya giren hatada oluşturulmuş rezervasyonları iptal eder", async () => {
    // Aksi hâlde kullanıcı ödemediği bir bileti üzerinde bulurdu.
    apiClient.post
      .mockResolvedValueOnce(reservationDto({ id: 1 }))
      .mockRejectedValueOnce(new ConflictError("Koltuk alınmış."))
      .mockResolvedValueOnce(null);

    await expect(
      reservationService.createReservation({
        cartItems: [cartItem(), cartItem({ sessionId: 9 })],
        buyer: BUYER,
      })
    ).rejects.toBeInstanceOf(ConflictError);

    expect(apiClient.post).toHaveBeenCalledWith("/reservations/1/cancel");
  });
});

describe("reservationService okuma uçları", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("kullanıcının kendi rezervasyonlarını sayfalı okur", async () => {
    apiClient.get.mockResolvedValue({
      items: [
        {
          id: 1,
          resNo: "RES-001",
          showtimeId: 7,
          showtimeStart: "2026-09-01T18:00:00+03:00",
          movieTitle: "Çığlık",
          ticketCount: 2,
          total: 360,
          status: "Completed",
        },
      ],
      totalCount: 1,
    });

    const result = await reservationService.getMyReservations();

    expect(apiClient.get).toHaveBeenCalledWith(
      "/reservations/my?pageNumber=1&pageSize=50"
    );
    expect(result.items[0].movieTitle).toBe("Çığlık");
    expect(result.totalCount).toBe(1);
  });

  it("yönetim listesinde filtreleri sorgu dizesine koyar", async () => {
    apiClient.get.mockResolvedValue({ items: [], totalCount: 0 });

    await reservationService.getAllReservations({
      status: "Completed",
      movieId: 4,
    });

    const [path] = apiClient.get.mock.calls[0];
    expect(path).toContain("status=Completed");
    expect(path).toContain("movieId=4");
  });

  it("boş cevapta çökmez", async () => {
    apiClient.get.mockResolvedValue(null);

    await expect(
      reservationService.getAllReservations()
    ).resolves.toEqual({ items: [], totalCount: 0 });
  });
});
