import { describe, expect, it } from "vitest";

import movieService from "./movieService.js";

describe("movieService.isMovieReleased", () => {
  it("vizyon tarihi bugünden önceyse vizyonda kabul eder", () => {
    const movie = { releaseDate: "2026-07-10" };

    expect(
      movieService.isMovieReleased(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(true);
  });

  it("vizyon tarihi tam bugünse vizyonda kabul eder", () => {
    const movie = { releaseDate: "2026-07-16" };

    expect(
      movieService.isMovieReleased(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(true);
  });

  it("vizyon tarihi ileri bir tarihse henüz vizyonda değildir", () => {
    const movie = { releaseDate: "2026-08-14" };

    expect(
      movieService.isMovieReleased(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(false);
  });

  it("releaseDate alanı yoksa vizyonda kabul eder", () => {
    expect(
      movieService.isMovieReleased(
        {},
        new Date(2026, 6, 16)
      )
    ).toBe(true);
  });
});

describe("movieService.getDaysUntilRelease", () => {
  it("kalan gün sayısını doğru hesaplar", () => {
    const movie = { releaseDate: "2026-08-14" };

    expect(
      movieService.getDaysUntilRelease(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(29);
  });

  it("vizyon günü ise 0 döner", () => {
    const movie = { releaseDate: "2026-07-16" };

    expect(
      movieService.getDaysUntilRelease(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(0);
  });
});

describe("movieService.isMovieArchived", () => {
  it("screeningEndDate bugünden önceyse arşivlenmiş kabul eder", () => {
    const movie = { screeningEndDate: "2026-07-10" };

    expect(
      movieService.isMovieArchived(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(true);
  });

  it("screeningEndDate tam bugünse hâlâ vizyonda kabul eder (son gösterim günü)", () => {
    const movie = { screeningEndDate: "2026-07-16" };

    expect(
      movieService.isMovieArchived(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(false);
  });

  it("screeningEndDate ileri bir tarihse arşivlenmemiş kabul eder", () => {
    const movie = { screeningEndDate: "2026-08-14" };

    expect(
      movieService.isMovieArchived(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(false);
  });

  it("screeningEndDate alanı yoksa asla arşivlenmiş sayılmaz", () => {
    expect(
      movieService.isMovieArchived(
        {},
        new Date(2026, 6, 16)
      )
    ).toBe(false);
  });
});

describe("REQ-05 — arşivlenen film verisi silinmez", () => {
  it("vizyon süresi dolmuş 'Son Tren' filmi getMovieById ile hâlâ erişilebilir", async () => {
    const movie = await movieService.getMovieById(7);

    expect(movie.title).toBe("Son Tren");
    expect(
      movieService.isMovieArchived(movie)
    ).toBe(true);
  });
});

describe("movieService.isWithinComingSoonWindow", () => {
  it("vizyon tarihi 6 ay penceresi içindeyse true döner", () => {
    const movie = { releaseDate: "2027-01-10" };

    expect(
      movieService.isWithinComingSoonWindow(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(true);
  });

  it("vizyon tarihi tam 6 ay sonraysa (pencere sınırı) true döner", () => {
    const movie = { releaseDate: "2027-01-16" };

    expect(
      movieService.isWithinComingSoonWindow(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(true);
  });

  it("vizyon tarihi 6 aydan uzaksa false döner", () => {
    const movie = { releaseDate: "2027-01-17" };

    expect(
      movieService.isWithinComingSoonWindow(
        movie,
        new Date(2026, 6, 16)
      )
    ).toBe(false);
  });

  it("releaseDate alanı yoksa true döner (isMovieReleased ile aynı güvenli varsayılan)", () => {
    expect(
      movieService.isWithinComingSoonWindow(
        {},
        new Date(2026, 6, 16)
      )
    ).toBe(true);
  });
});

describe("movieService.parseIsoDateOnly", () => {
  it("ISO tarih dizisini yerel tarihe çevirir", () => {
    const parsed = movieService.parseIsoDateOnly(
      "2026-08-14"
    );

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(14);
  });
});
