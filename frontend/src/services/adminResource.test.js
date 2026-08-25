import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "./apiClient.js";
import { createAdminResource, MAX_PAGE_SIZE } from "./adminResource.js";

vi.mock("./apiClient.js", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
}));

// Sayfalı bir cevabı, backend'in döndürdüğü alan adlarıyla üretir.
function page(items, { page: pageNumber, pageSize, totalCount }) {
  return {
    items,
    totalCount,
    page: pageNumber,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

const resource = createAdminResource({
  basePath: "/cinemas",
  mapDto: (dto) => ({ id: dto.id, name: dto.name }),
  toCommand: (values) => ({ name: values.name.trim() }),
});

// İstenen sorgu dizesini URLSearchParams olarak verir; anahtar sırasına
// bağlı kalmadan tek tek alan doğrulanabilsin diye.
function queryOf(callIndex) {
  const url = apiClient.get.mock.calls[callIndex][0];
  return new URLSearchParams(url.split("?")[1] ?? "");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createAdminResource.list", () => {
  it("sunucunun kabul ettiği azami sayfa boyutunu aşmaz", async () => {
    apiClient.get.mockResolvedValue(
      page([], { page: 1, pageSize: MAX_PAGE_SIZE, totalCount: 0 })
    );

    await resource.list();

    // Sunucu tarafındaki kural: InclusiveBetween(1, 100).
    expect(Number(queryOf(0).get("pageSize"))).toBeLessThanOrEqual(100);
  });

  it("şehir süzgeci verilmediğinde cityId göndermez", async () => {
    apiClient.get.mockResolvedValue(
      page([], { page: 1, pageSize: MAX_PAGE_SIZE, totalCount: 0 })
    );

    await resource.list();

    // cityId=0 sunucuda "geçerli bir şehir seçilmelidir" hatası veriyordu.
    expect(queryOf(0).has("cityId")).toBe(false);
  });

  it("boş ve tanımsız süzgeçleri sorguya eklemez", async () => {
    apiClient.get.mockResolvedValue(
      page([], { page: 1, pageSize: MAX_PAGE_SIZE, totalCount: 0 })
    );

    await resource.list({ cityId: "", districtId: undefined, q: null });

    const query = queryOf(0);
    expect(query.has("cityId")).toBe(false);
    expect(query.has("districtId")).toBe(false);
    expect(query.has("q")).toBe(false);
  });

  it("verilen süzgeci sorguya taşır", async () => {
    apiClient.get.mockResolvedValue(
      page([], { page: 1, pageSize: MAX_PAGE_SIZE, totalCount: 0 })
    );

    await resource.list({ cityId: 7 });

    expect(queryOf(0).get("cityId")).toBe("7");
  });
});

describe("createAdminResource.list sayfalama", () => {
  it("tek sayfaya sığan sonucu tek istekte alır", async () => {
    apiClient.get.mockResolvedValue(
      page([{ id: 1, name: "Kadıköy" }], {
        page: 1,
        pageSize: MAX_PAGE_SIZE,
        totalCount: 1,
      })
    );

    const items = await resource.list();

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(items).toEqual([{ id: 1, name: "Kadıköy" }]);
  });

  it("sayfa sınırını aşan kaydı sessizce kırpmaz, kalan sayfaları da çeker", async () => {
    const first = Array.from({ length: MAX_PAGE_SIZE }, (_, i) => ({
      id: i + 1,
      name: `Sinema ${i + 1}`,
    }));
    const second = [{ id: 101, name: "Sinema 101" }];
    const totalCount = MAX_PAGE_SIZE + 1;

    apiClient.get
      .mockResolvedValueOnce(
        page(first, { page: 1, pageSize: MAX_PAGE_SIZE, totalCount })
      )
      .mockResolvedValueOnce(
        page(second, { page: 2, pageSize: MAX_PAGE_SIZE, totalCount })
      );

    const items = await resource.list();

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(queryOf(0).get("pageNumber")).toBe("1");
    expect(queryOf(1).get("pageNumber")).toBe("2");
    expect(items).toHaveLength(totalCount);
    expect(items.at(-1)).toEqual({ id: 101, name: "Sinema 101" });
  });

  it("sayfalar arasında süzgeci korur", async () => {
    const totalCount = MAX_PAGE_SIZE + 1;
    const first = Array.from({ length: MAX_PAGE_SIZE }, (_, i) => ({
      id: i + 1,
      name: `Sinema ${i + 1}`,
    }));

    apiClient.get
      .mockResolvedValueOnce(
        page(first, { page: 1, pageSize: MAX_PAGE_SIZE, totalCount })
      )
      .mockResolvedValueOnce(
        page([{ id: 101, name: "Son" }], {
          page: 2,
          pageSize: MAX_PAGE_SIZE,
          totalCount,
        })
      );

    await resource.list({ cityId: 3 });

    expect(queryOf(1).get("cityId")).toBe("3");
  });

  it("sayfalamayan uçların düz dizisini olduğu gibi alır", async () => {
    // /districts gibi uçlar PagedResult değil, doğrudan dizi döndürüyor.
    apiClient.get.mockResolvedValue([{ id: 5, name: "Çankaya" }]);

    const items = await resource.list();

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(items).toEqual([{ id: 5, name: "Çankaya" }]);
  });

  it("çağıran kendi sayfasını istediğinde tüm sayfaları dolaşmaz", async () => {
    apiClient.get.mockResolvedValue(
      page([{ id: 1, name: "Kadıköy" }], {
        page: 2,
        pageSize: 10,
        totalCount: 90,
      })
    );

    await resource.list({ pageNumber: 2, pageSize: 10 });

    expect(apiClient.get).toHaveBeenCalledTimes(1);
    expect(queryOf(0).get("pageNumber")).toBe("2");
    expect(queryOf(0).get("pageSize")).toBe("10");
  });

  it("totalPages tutarsız gelse bile boş sayfada durur", async () => {
    // Sunucu yanlış bir totalPages bildirse dahi döngü kapanmalı.
    apiClient.get
      .mockResolvedValueOnce(
        page([{ id: 1, name: "Tek" }], {
          page: 1,
          pageSize: MAX_PAGE_SIZE,
          totalCount: 9999,
        })
      )
      .mockResolvedValue(
        page([], { page: 2, pageSize: MAX_PAGE_SIZE, totalCount: 9999 })
      );

    const items = await resource.list();

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(items).toEqual([{ id: 1, name: "Tek" }]);
  });
});
