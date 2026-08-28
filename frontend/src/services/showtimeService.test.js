import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "./apiClient.js";
import { MAX_PAGE_SIZE } from "./adminResource.js";
import showtimeService from "./showtimeService.js";

vi.mock("./apiClient.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
}));

function page(items, { page: pageNumber, totalCount }) {
  return {
    items,
    totalCount,
    page: pageNumber,
    pageSize: MAX_PAGE_SIZE,
    totalPages: Math.ceil(totalCount / MAX_PAGE_SIZE),
  };
}

function seans(id) {
  return {
    id,
    movieId: 1,
    hallId: 1,
    startDatetime: "2026-09-01T18:00:00+03:00",
    basePrice: 150,
    format: "Standard2D",
    hallName: "Salon 1",
    cinemaName: "Test Sinema",
    totalSeats: 80,
  };
}

function queryOf(callIndex) {
  const url = apiClient.get.mock.calls[callIndex][0];
  return new URLSearchParams(url.split("?")[1] ?? "");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("showtimeService.listByCinema", () => {
  it("sunucunun kabul ettiği azami sayfa boyutunu aşmaz", async () => {
    apiClient.get.mockResolvedValue(page([], { page: 1, totalCount: 0 }));

    await showtimeService.listByCinema(7);

    // pageSize=200 gonderiliyordu; sunucu InclusiveBetween(1, 100) ile
    // reddedince yonetim ekrani sonsuza kadar yukleniyordu.
    expect(Number(queryOf(0).get("pageSize"))).toBeLessThanOrEqual(100);
  });

  it("sinema kimliğini yola koyar", async () => {
    apiClient.get.mockResolvedValue(page([], { page: 1, totalCount: 0 }));

    await showtimeService.listByCinema(7);

    expect(apiClient.get.mock.calls[0][0]).toContain("/showtimes/by-cinema/7");
  });

  it("100'ü aşan seansı sessizce kırpmaz", async () => {
    const ilk = Array.from({ length: MAX_PAGE_SIZE }, (_, i) => seans(i + 1));
    const totalCount = MAX_PAGE_SIZE + 2;

    apiClient.get
      .mockResolvedValueOnce(page(ilk, { page: 1, totalCount }))
      .mockResolvedValueOnce(
        page([seans(101), seans(102)], { page: 2, totalCount })
      );

    const items = await showtimeService.listByCinema(7);

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(items).toHaveLength(totalCount);
    expect(items.at(-1).id).toBe(102);
  });

  it("DTO alanlarını arayüz şekline çevirir", async () => {
    apiClient.get.mockResolvedValue(page([seans(5)], { page: 1, totalCount: 1 }));

    const [item] = await showtimeService.listByCinema(7);

    expect(item).toMatchObject({
      id: 5,
      basePrice: 150,
      hallName: "Salon 1",
      cinemaName: "Test Sinema",
      totalSeats: 80,
    });
  });

  it("eksik alanlarda güvenli varsayılan verir", async () => {
    apiClient.get.mockResolvedValue(
      page([{ id: 9, movieId: 1, hallId: 1, startDatetime: "x", format: "IMAX" }], {
        page: 1,
        totalCount: 1,
      })
    );

    const [item] = await showtimeService.listByCinema(7);

    expect(item.basePrice).toBe(0);
    expect(item.hallName).toBe("");
    expect(item.totalSeats).toBe(0);
  });
});
