import { beforeEach, describe, expect, it, vi } from "vitest";

import { SEAT_STATUS } from "../domain/seatStatus.js";
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
const { default: seatService } = await import("./seatService.js");

function seatDto(overrides = {}) {
  return {
    seatId: 1,
    seatRow: 1,
    seatColumn: 1,
    type: "Regular",
    isActive: true,
    status: "Available",
    lockedByCurrentUser: false,
    ...overrides,
  };
}

describe("seatService.getShowtimeSeatMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("koltukları etiketleyip durum haritasını kurar", async () => {
    apiClient.get.mockResolvedValue([
      seatDto({ seatId: 11, seatRow: 1, seatColumn: 1 }),
      seatDto({ seatId: 12, seatRow: 1, seatColumn: 2, status: "Reserved" }),
      seatDto({ seatId: 21, seatRow: 2, seatColumn: 1, status: "Locked" }),
    ]);

    const { seats, statuses } = await seatService.getShowtimeSeatMap(7);

    expect(apiClient.get).toHaveBeenCalledWith("/showtimes/7/seats");

    expect(seats.map((seat) => seat.label)).toEqual(["A1", "A2", "B1"]);
    expect(statuses).toEqual({
      11: SEAT_STATUS.BOS,
      12: SEAT_STATUS.DOLU,
      21: SEAT_STATUS.GECICI_KILITLI,
    });
  });

  it("kullanıcının kendi kilidini seçilebilir (BOS) sayar", async () => {
    // Kendi tuttuğu koltuk "başkası aldı" gibi görünmemeli; sayfayı
    // yenilediğinde seçimini sürdürebilmeli.
    apiClient.get.mockResolvedValue([
      seatDto({
        seatId: 5,
        status: "Locked",
        lockedByCurrentUser: true,
      }),
    ]);

    const { statuses } = await seatService.getShowtimeSeatMap(7);

    expect(statuses[5]).toBe(SEAT_STATUS.BOS);
  });

  it("devre dışı koltukları listeye ve haritaya koymaz", async () => {
    apiClient.get.mockResolvedValue([
      seatDto({ seatId: 1, isActive: true }),
      seatDto({ seatId: 2, seatColumn: 2, isActive: false }),
    ]);

    const { seats, statuses } = await seatService.getShowtimeSeatMap(7);

    expect(seats).toHaveLength(1);
    expect(statuses[2]).toBeUndefined();
  });

  it("boş cevapta çökmez", async () => {
    apiClient.get.mockResolvedValue(null);

    await expect(seatService.getShowtimeSeatMap(7)).resolves.toEqual({
      seats: [],
      statuses: {},
    });
  });
});

describe("seatService.lockSeats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("her koltuk için kilit isteği atar", async () => {
    apiClient.post
      .mockResolvedValueOnce({ id: 100, seatId: 11 })
      .mockResolvedValueOnce({ id: 101, seatId: 12 });

    const locks = await seatService.lockSeats({
      showtimeId: 7,
      seatIds: [11, 12],
    });

    expect(locks).toEqual([
      { id: 100, seatId: 11 },
      { id: 101, seatId: 12 },
    ]);

    expect(apiClient.post).toHaveBeenNthCalledWith(1, "/seatlocks", {
      showtimeId: 7,
      seatId: 11,
      lockMinutes: seatService.DEFAULT_LOCK_MINUTES,
    });
  });

  it("araya giren çakışmada o ana kadar alınan kilitleri bırakır", async () => {
    // Aksi hâlde kullanıcı hiç kullanmayacağı koltukları dakikalarca tutardı.
    apiClient.post
      .mockResolvedValueOnce({ id: 100, seatId: 11 })
      .mockRejectedValueOnce(new ConflictError("Koltuk kilitli."));
    apiClient.del.mockResolvedValue(null);

    await expect(
      seatService.lockSeats({ showtimeId: 7, seatIds: [11, 12] })
    ).rejects.toBeInstanceOf(ConflictError);

    expect(apiClient.del).toHaveBeenCalledWith("/seatlocks/100");
  });
});

describe("seatService.renewLocks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("seçimin tamamını tek istekte yeniler", async () => {
    apiClient.post.mockResolvedValue([]);

    await seatService.renewLocks({
      showtimeId: 7,
      seatIds: [11, 12],
      lockMinutes: 5,
    });

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    expect(apiClient.post).toHaveBeenCalledWith("/seatlocks/renew", {
      showtimeId: 7,
      seatIds: [11, 12],
      lockMinutes: 5,
    });
  });
});

describe("seatService.releaseLocks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("her kilidi ayrı ayrı bırakır", async () => {
    apiClient.del.mockResolvedValue(null);

    await seatService.releaseLocks([100, 101]);

    expect(apiClient.del).toHaveBeenCalledWith("/seatlocks/100");
    expect(apiClient.del).toHaveBeenCalledWith("/seatlocks/101");
  });

  it("temizlik işi olduğu için tek tek hataları yutar", async () => {
    // Kilit zaten düşmüşse kullanıcıya gösterilecek bir şey yok.
    apiClient.del.mockRejectedValue(new Error("404"));

    await expect(seatService.releaseLocks([100])).resolves.toBeUndefined();
  });

  it("boş listede istek atmaz", async () => {
    await seatService.releaseLocks();

    expect(apiClient.del).not.toHaveBeenCalled();
  });
});
