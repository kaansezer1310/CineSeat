import { describe, expect, it } from "vitest";

import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  hasAnyPermission,
  hasPermission,
  resolvePermissions,
} from "./permissions.js";

describe("permissions", () => {
  it("cevapta permissions varsa onu kullanır", () => {
    const user = {
      role: "member",
      permissions: [PERMISSIONS.COMMENT_MODERATE],
    };

    expect(resolvePermissions(user)).toEqual([
      PERMISSIONS.COMMENT_MODERATE,
    ]);
  });

  it("permissions gelmeyen admin'i geçici olarak tam yetkili sayar", () => {
    // T5 geçiş dönemi: backend izinleri henüz token'a koymuyor.
    expect(resolvePermissions({ role: "admin" })).toEqual([
      ...ALL_PERMISSIONS,
    ]);
  });

  it("permissions gelmeyen üyeye hiçbir izin vermez", () => {
    expect(resolvePermissions({ role: "member" })).toEqual([]);
  });

  it("misafir kullanıcıda izin listesi boştur", () => {
    expect(resolvePermissions(null)).toEqual([]);
  });

  it("boş permissions dizisi admin geri düşüşünü devre dışı bırakır", () => {
    // Yetkileri elinden alınmış bir admin, fallback yüzünden yeniden
    // tam yetkili görünmemeli.
    expect(resolvePermissions({ role: "admin", permissions: [] })).toEqual(
      []
    );
  });

  it("hasPermission tek izni doğrular", () => {
    const user = { role: "member", permissions: [PERMISSIONS.MOVIE_MANAGE] };

    expect(hasPermission(user, PERMISSIONS.MOVIE_MANAGE)).toBe(true);
    expect(hasPermission(user, PERMISSIONS.CINEMA_MANAGE)).toBe(false);
  });

  it("hasAnyPermission listeden en az birini arar", () => {
    const user = { role: "member", permissions: [PERMISSIONS.MOVIE_MANAGE] };

    expect(
      hasAnyPermission(user, [
        PERMISSIONS.CINEMA_MANAGE,
        PERMISSIONS.MOVIE_MANAGE,
      ])
    ).toBe(true);

    expect(
      hasAnyPermission(user, [PERMISSIONS.CINEMA_MANAGE])
    ).toBe(false);

    expect(hasAnyPermission(user, [])).toBe(false);
  });
});
