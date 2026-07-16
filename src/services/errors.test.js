import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ApiError,
  NotFoundError,
  shouldRetryQuery,
} from "./errors.js";

describe("shouldRetryQuery", () => {
  it("bulunamadı ve istemci hatalarını yeniden denemez", () => {
    expect(
      shouldRetryQuery(
        0,
        new NotFoundError("Film bulunamadı.")
      )
    ).toBe(false);
    expect(
      shouldRetryQuery(
        0,
        new ApiError("Geçersiz istek.", {
          status: 422,
        })
      )
    ).toBe(false);
  });

  it("geçici hataları en fazla iki kez yeniden dener", () => {
    const transientError = new Error(
      "Geçici bağlantı hatası."
    );

    expect(
      shouldRetryQuery(0, transientError)
    ).toBe(true);
    expect(
      shouldRetryQuery(1, transientError)
    ).toBe(true);
    expect(
      shouldRetryQuery(2, transientError)
    ).toBe(false);
  });

  it("sunucu hatalarını sınırlı şekilde yeniden dener", () => {
    const serverError = new ApiError(
      "Sunucu hatası.",
      {
        status: 503,
      }
    );

    expect(shouldRetryQuery(0, serverError)).toBe(true);
    expect(shouldRetryQuery(1, serverError)).toBe(true);
    expect(shouldRetryQuery(2, serverError)).toBe(false);
  });
});
