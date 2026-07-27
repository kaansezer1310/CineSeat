import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SEAT_STATUS,
  canTransitionSeatStatus,
  getSeatStatusLabel,
  isSeatSelectable,
  isValidSeatStatus,
  resolveDisplaySeatStatus,
} from "./seatStatus.js";

describe("isValidSeatStatus", () => {
  it("dört geçerli durumu kabul eder", () => {
    expect(isValidSeatStatus(SEAT_STATUS.BOS)).toBe(true);
    expect(isValidSeatStatus(SEAT_STATUS.SECILI)).toBe(true);
    expect(
      isValidSeatStatus(SEAT_STATUS.GECICI_KILITLI)
    ).toBe(true);
    expect(isValidSeatStatus(SEAT_STATUS.DOLU)).toBe(true);
  });

  it("bilinmeyen veya geçersiz değerleri reddeder", () => {
    expect(isValidSeatStatus("REZERVE")).toBe(false);
    expect(isValidSeatStatus("")).toBe(false);
    expect(isValidSeatStatus(null)).toBe(false);
    expect(isValidSeatStatus(undefined)).toBe(false);
    expect(isValidSeatStatus(42)).toBe(false);
  });
});

describe("canTransitionSeatStatus — REQ-01 geçiş tablosu", () => {
  it("dokümante edilen ileri akışa izin verir: BOS -> SECILI -> GECICI_KILITLI -> DOLU", () => {
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.BOS,
        SEAT_STATUS.SECILI
      )
    ).toBe(true);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.SECILI,
        SEAT_STATUS.GECICI_KILITLI
      )
    ).toBe(true);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.GECICI_KILITLI,
        SEAT_STATUS.DOLU
      )
    ).toBe(true);
  });

  it("dokümante edilen geri dönüşlere izin verir", () => {
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.SECILI,
        SEAT_STATUS.BOS
      )
    ).toBe(true);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.GECICI_KILITLI,
        SEAT_STATUS.BOS
      )
    ).toBe(true);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.DOLU,
        SEAT_STATUS.BOS
      )
    ).toBe(true);
  });

  it("REQ-01'de tanımlanmayan geçişleri reddeder", () => {
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.BOS,
        SEAT_STATUS.GECICI_KILITLI
      )
    ).toBe(false);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.BOS,
        SEAT_STATUS.DOLU
      )
    ).toBe(false);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.SECILI,
        SEAT_STATUS.DOLU
      )
    ).toBe(false);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.GECICI_KILITLI,
        SEAT_STATUS.SECILI
      )
    ).toBe(false);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.DOLU,
        SEAT_STATUS.GECICI_KILITLI
      )
    ).toBe(false);
    expect(
      canTransitionSeatStatus(
        SEAT_STATUS.DOLU,
        SEAT_STATUS.SECILI
      )
    ).toBe(false);
  });

  it("geçersiz durum isimlerini güvenle reddeder", () => {
    expect(
      canTransitionSeatStatus("REZERVE", SEAT_STATUS.BOS)
    ).toBe(false);
    expect(
      canTransitionSeatStatus(SEAT_STATUS.BOS, "REZERVE")
    ).toBe(false);
    expect(canTransitionSeatStatus(null, undefined)).toBe(
      false
    );
  });
});

describe("isSeatSelectable", () => {
  it("BOS ve SECILI koltuklarda tıklama ile seçim/seçim kaldırmayı serbest bırakır", () => {
    expect(isSeatSelectable(SEAT_STATUS.BOS)).toBe(true);
    expect(isSeatSelectable(SEAT_STATUS.SECILI)).toBe(true);
  });

  it("GECICI_KILITLI ve DOLU koltukların seçilmesini engeller", () => {
    expect(
      isSeatSelectable(SEAT_STATUS.GECICI_KILITLI)
    ).toBe(false);
    expect(isSeatSelectable(SEAT_STATUS.DOLU)).toBe(false);
  });
});

describe("resolveDisplaySeatStatus — durum çözümleme önceliği", () => {
  it("BOS bir koltuk yerel olarak seçiliyse SECILI gösterir", () => {
    expect(
      resolveDisplaySeatStatus(SEAT_STATUS.BOS, true)
    ).toBe(SEAT_STATUS.SECILI);
  });

  it("BOS bir koltuk yerel olarak seçili değilse BOS gösterir", () => {
    expect(
      resolveDisplaySeatStatus(SEAT_STATUS.BOS, false)
    ).toBe(SEAT_STATUS.BOS);
  });

  it("DOLU bir koltuk yerel seçimden bağımsız olarak asla SECILI gösterilmez", () => {
    expect(
      resolveDisplaySeatStatus(SEAT_STATUS.DOLU, true)
    ).toBe(SEAT_STATUS.DOLU);
    expect(
      resolveDisplaySeatStatus(SEAT_STATUS.DOLU, false)
    ).toBe(SEAT_STATUS.DOLU);
  });

  it("GECICI_KILITLI bir koltuk yerel seçimden bağımsız olarak asla SECILI gösterilmez", () => {
    expect(
      resolveDisplaySeatStatus(
        SEAT_STATUS.GECICI_KILITLI,
        true
      )
    ).toBe(SEAT_STATUS.GECICI_KILITLI);
    expect(
      resolveDisplaySeatStatus(
        SEAT_STATUS.GECICI_KILITLI,
        false
      )
    ).toBe(SEAT_STATUS.GECICI_KILITLI);
  });

  it("geçersiz/bozuk stored status güvenle BOS'a düşer", () => {
    expect(
      resolveDisplaySeatStatus("BILINMEYEN_DURUM", false)
    ).toBe(SEAT_STATUS.BOS);
    expect(
      resolveDisplaySeatStatus(undefined, true)
    ).toBe(SEAT_STATUS.SECILI);
  });
});

describe("getSeatStatusLabel", () => {
  it("her durum için okunabilir bir Türkçe etiket döner", () => {
    expect(getSeatStatusLabel(SEAT_STATUS.BOS)).toBe("Boş");
    expect(getSeatStatusLabel(SEAT_STATUS.SECILI)).toBe(
      "Seçili"
    );
    expect(
      getSeatStatusLabel(SEAT_STATUS.GECICI_KILITLI)
    ).toBe("Geçici kilitli");
    expect(getSeatStatusLabel(SEAT_STATUS.DOLU)).toBe(
      "Dolu"
    );
  });

  it("bilinmeyen bir durum için BOS etiketine düşer", () => {
    expect(getSeatStatusLabel("BILINMEYEN")).toBe("Boş");
  });
});
