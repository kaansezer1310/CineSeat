import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { SEAT_STATUS } from "../domain/seatStatus.js";
import seatService from "./seatService.js";

describe("seatService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function flushWait(promise) {
    const settleInterest = promise.then(
      (value) => {
        return { status: "fulfilled", value };
      },
      (error) => {
        return { status: "rejected", error };
      }
    );

    await vi.runAllTimersAsync();

    return settleInterest;
  }

  describe("geriye dönük uyumluluk (getReservedSeatsBySessionId)", () => {
    it("hiç kayıt yoksa mock başlangıç verisine düşer", async () => {
      const result = await flushWait(
        seatService.getReservedSeatsBySessionId(101)
      );

      expect(result.status).toBe("fulfilled");
      expect(result.value).toEqual([
        "A2",
        "A3",
        "B5",
        "C1",
        "D7",
      ]);
    });

    it("mevcut (eski format) düz koltuk dizisini okuyabilir", async () => {
      localStorage.setItem(
        "reserved-seats-999",
        JSON.stringify(["A1", "A2"])
      );

      const result = await flushWait(
        seatService.getReservedSeatsBySessionId(999)
      );

      expect(result.value).toEqual(["A1", "A2"]);
    });
  });

  describe("bozuk / beklenmeyen storage verisi", () => {
    it("bozuk JSON durumunda çökmez, boş listeye düşer", async () => {
      localStorage.setItem(
        "reserved-seats-555",
        "{ bozuk-json"
      );

      const result = await flushWait(
        seatService.getReservedSeatsBySessionId(555)
      );

      expect(result.status).toBe("fulfilled");
      expect(result.value).toEqual([]);
    });

    it("geçerli JSON ama beklenmeyen şema (dizi değil) durumunda boş listeye düşer", async () => {
      localStorage.setItem(
        "reserved-seats-556",
        JSON.stringify({ A1: true })
      );

      const result = await flushWait(
        seatService.getReservedSeatsBySessionId(556)
      );

      expect(result.value).toEqual([]);
    });

    it("dizi içindeki geçersiz (string olmayan) öğeleri süzer", async () => {
      localStorage.setItem(
        "reserved-seats-557",
        JSON.stringify(["A1", 42, null, "", "B2"])
      );

      const result = await flushWait(
        seatService.getReservedSeatsBySessionId(557)
      );

      expect(result.value).toEqual(["A1", "B2"]);
    });

    it("bozuk kilit verisi de booking sayfasını çökertmeden boş listeye düşer", async () => {
      localStorage.setItem(
        "locked-seats-558",
        "yanlis-json-{{"
      );

      const result = await flushWait(
        seatService.getSeatStatusesBySessionId(558)
      );

      expect(result.status).toBe("fulfilled");
      expect(result.value).toEqual({});
    });
  });

  describe("getSeatStatusesBySessionId — dört durumlu harita", () => {
    it("DOLU ve GECICI_KILITLI koltukları ayrı ayrı işaretler, BOS koltukları haritaya koymaz", async () => {
      const result = await flushWait(
        seatService.getSeatStatusesBySessionId(101)
      );

      expect(result.value.A2).toBe(SEAT_STATUS.DOLU);
      expect(result.value.A5).toBe(
        SEAT_STATUS.GECICI_KILITLI
      );
      expect(result.value.Z9).toBeUndefined();
    });
  });

  describe("reserveSeats — GECICI_KILITLI/BOS -> DOLU", () => {
    it("koltukları DOLU'ya taşır ve mevcut kilit kaydını temizler", async () => {
      localStorage.setItem(
        "locked-seats-777",
        JSON.stringify({ A1: "mock-token" })
      );

      const result = await flushWait(
        seatService.reserveSeats({
          sessionId: 777,
          seats: ["A1"],
        })
      );

      expect(result.status).toBe("fulfilled");
      expect(result.value).toEqual(["A1"]);

      const storedDolu = JSON.parse(
        localStorage.getItem("reserved-seats-777")
      );
      const storedLocked = JSON.parse(
        localStorage.getItem("locked-seats-777")
      );

      expect(storedDolu).toEqual(["A1"]);
      expect(storedLocked).toEqual({});
    });

    it("zaten DOLU olan bir koltuğu asla tekrar rezerve etmez (servis tarafı koruma)", async () => {
      localStorage.setItem(
        "reserved-seats-778",
        JSON.stringify(["A1"])
      );

      const resultPromise = seatService.reserveSeats({
        sessionId: 778,
        seats: ["A1"],
      });

      const result = await flushWait(resultPromise);

      expect(result.status).toBe("rejected");
      expect(result.error.name).toBe("ConflictError");
    });
  });

  describe("lockSeats / releaseLockedSeats — GECICI_KILITLI geçişleri", () => {
    it("BOS koltukları kilitler (GECICI_KILITLI yapar)", async () => {
      const result = await flushWait(
        seatService.lockSeats({
          sessionId: 888,
          seats: ["C1"],
          lockToken: "mock-token",
        })
      );

      expect(result.status).toBe("fulfilled");
      expect(result.value).toEqual(["C1"]);

      const statusesResult = await flushWait(
        seatService.getSeatStatusesBySessionId(888)
      );

      expect(statusesResult.value.C1).toBe(
        SEAT_STATUS.GECICI_KILITLI
      );
    });

    it("zaten DOLU olan bir koltuğu kilitlemeyi reddeder", async () => {
      localStorage.setItem(
        "reserved-seats-889",
        JSON.stringify(["C1"])
      );

      const result = await flushWait(
        seatService.lockSeats({
          sessionId: 889,
          seats: ["C1"],
          lockToken: "mock-token",
        })
      );

      expect(result.status).toBe("rejected");
      expect(result.error.name).toBe("ConflictError");
    });

    it("kilitli bir koltuğu REQ-19/REQ-12/REQ-13 senaryosu için BOS'a döndürür", async () => {
      await flushWait(
        seatService.lockSeats({
          sessionId: 890,
          seats: ["D1"],
          lockToken: "mock-token",
        })
      );

      const releaseResult = await flushWait(
        seatService.releaseLockedSeats({
          sessionId: 890,
          seats: ["D1"],
          lockToken: "mock-token",
        })
      );

      expect(releaseResult.status).toBe("fulfilled");
      expect(releaseResult.value).toEqual([]);

      const statusesResult = await flushWait(
        seatService.getSeatStatusesBySessionId(890)
      );

      expect(statusesResult.value.D1).toBeUndefined();
    });
  });

  describe("cancelReservedSeats — DOLU -> BOS (rezervasyon iptali)", () => {
    it("DOLU bir koltuğu BOS'a döndürür", async () => {
      localStorage.setItem(
        "reserved-seats-950",
        JSON.stringify(["E1", "E2"])
      );

      const result = await flushWait(
        seatService.cancelReservedSeats({
          sessionId: 950,
          seats: ["E1"],
        })
      );

      expect(result.status).toBe("fulfilled");
      expect(result.value).toEqual(["E2"]);

      const statusesResult = await flushWait(
        seatService.getSeatStatusesBySessionId(950)
      );

      expect(statusesResult.value.E1).toBeUndefined();
      expect(statusesResult.value.E2).toBe(SEAT_STATUS.DOLU);
    });
  });

  describe("girdi doğrulama", () => {
    it("geçersiz seans numarasını reddeder", async () => {
      const result = await flushWait(
        seatService.getReservedSeatsBySessionId("abc")
      );

      expect(result.status).toBe("rejected");
    });

    it("dizi olmayan koltuk listesini reddeder", async () => {
      const result = await flushWait(
        seatService.reserveSeats({
          sessionId: 900,
          seats: "A1",
        })
      );

      expect(result.status).toBe("rejected");
    });

    it("boş koltuk listesini reddeder", async () => {
      const result = await flushWait(
        seatService.lockSeats({
          sessionId: 901,
          seats: [],
          lockToken: "mock-token",
        })
      );

      expect(result.status).toBe("rejected");
    });
  });
});
