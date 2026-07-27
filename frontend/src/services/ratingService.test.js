import { beforeEach, describe, expect, it } from "vitest";

import ratingService from "./ratingService.js";

describe("ratingService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hiç puan verilmemiş bir film için sıfır ortalama/oy sayısı döner (movie id 5, seed 0/0)", async () => {
    const rating = await ratingService.getMovieRating(5);

    expect(rating).toEqual({ average: 0, count: 0 });
  });

  it("submitRating sonrası ortalama ve oy sayısı güncellenir", async () => {
    const updated = await ratingService.submitRating(5, 1, 5);

    expect(updated).toEqual({ average: 5, count: 1 });
  });

  it("aynı kullanıcı tekrar puanlarsa önceki puanının üzerine yazar (yeni oy eklenmez)", async () => {
    await ratingService.submitRating(5, 1, 5);
    const updated = await ratingService.submitRating(5, 1, 3);

    expect(updated).toEqual({ average: 3, count: 1 });
  });

  it("farklı kullanıcılar puanlarsa ortalama doğru hesaplanır", async () => {
    await ratingService.submitRating(5, 1, 4);
    const updated = await ratingService.submitRating(5, 2, 2);

    expect(updated).toEqual({ average: 3, count: 2 });
  });

  it("geçersiz puan (0, 6, ondalık) reddedilir", async () => {
    await expect(
      ratingService.submitRating(5, 1, 0)
    ).rejects.toThrow();
    await expect(
      ratingService.submitRating(5, 1, 6)
    ).rejects.toThrow();
    await expect(
      ratingService.submitRating(5, 1, 3.5)
    ).rejects.toThrow();
  });

  it("getUserRating, kullanıcı henüz puanlamamışsa null döner", async () => {
    const userRating = await ratingService.getUserRating(5, 1);

    expect(userRating).toBeNull();
  });

  it("getUserRating, kullanıcının verdiği puanı döner", async () => {
    await ratingService.submitRating(5, 1, 4);

    const userRating = await ratingService.getUserRating(5, 1);

    expect(userRating).toBe(4);
  });

  it("seed ortalaması olan bir film (id 1) için kullanıcı puanı seed'in üzerine ağırlıklı eklenir", async () => {
    // movies.js id 1: rating { average: 4.3, count: 128 }
    const updated = await ratingService.submitRating(1, 1, 5);

    // (4.3*128 + 5) / 129 ≈ 4.31
    expect(updated.count).toBe(129);
    expect(updated.average).toBeCloseTo(4.31, 1);
  });
});
