import { afterEach, describe, expect, it, vi } from "vitest";

import { authService } from "./authService.js";

// authService artık gerçek backend'e (fetch) bağlı. Bu testler ağa hiç
// çıkmaz — global fetch'i, backend'in ExceptionHandlingMiddleware'inin ve
// AuthController'ının GERÇEKTE döndürdüğü JSON şekilleriyle taklit eder.
// Amaç: authService'in backend yanıtını doğru şekle (mapAuthResult/mapRole)
// çevirip çevirmediğini ve hata mesajlarını doğru ilettiğini doğrulamak.

function jsonResponse(body, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

describe("authService.login", () => {
  it("doğru bilgilerle backend'in döndürdüğü kullanıcıyı frontend şekline çevirir", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse({
          token: "fake-jwt-token",
          expiresAt: "2026-12-31T00:00:00Z",
          user: {
            id: 7,
            name: "Berke",
            surname: "Kuş",
            username: "berke",
            email: "berke@cineseat.com",
            role: "User",
          },
        })
      )
    );

    const user = await authService.login("berke@cineseat.com", "Test12");

    expect(user.email).toBe("berke@cineseat.com");
    expect(user.name).toBe("Berke Kuş");
    expect(user.role).toBe("member"); // backend "User" -> frontend "member"
    expect(user.token).toBe("fake-jwt-token");
    expect(user.password).toBeUndefined();
  });

  it("Admin rolünü frontend'in beklediği küçük harfe çevirir", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse({
          token: "admin-token",
          expiresAt: "2026-12-31T00:00:00Z",
          user: {
            id: 1,
            name: "Sistem",
            surname: "Yöneticisi",
            username: "admin",
            email: "admin@cineseat.com",
            role: "Admin",
          },
        })
      )
    );

    const user = await authService.login("admin@cineseat.com", "Admin123!");

    expect(user.role).toBe("admin");
  });

  it("yanlış bilgilerle backend'in 401 mesajını fırlatır (REQ-21)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse(
          {
            title: "Yetkisiz erişim",
            status: 401,
            detail: "Kullanıcı adı/e-posta veya parola hatalı.",
          },
          401
        )
      )
    );

    await expect(
      authService.login("berke@cineseat.com", "yanlisSifre")
    ).rejects.toThrow("Kullanıcı adı/e-posta veya parola hatalı.");
  });

  it("backend'e ulaşılamazsa anlaşılır bir ağ hatası fırlatır", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network down")))
    );

    await expect(
      authService.login("berke@cineseat.com", "Test12")
    ).rejects.toThrow("Sunucuya ulaşılamıyor");
  });
});

describe("authService.register", () => {
  it("yeni kullanıcıyı frontend şekline çevirir, role member olur", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse({
          token: "new-user-token",
          expiresAt: "2026-12-31T00:00:00Z",
          user: {
            id: 42,
            name: "Deneme",
            surname: "Kullanıcı",
            username: "authservicetest1",
            email: "authservice.test.1@cineseat.com",
            role: "User",
          },
        })
      )
    );

    const user = await authService.register({
      firstName: "Deneme",
      lastName: "Kullanıcı",
      email: "authservice.test.1@cineseat.com",
      username: "authservicetest1",
      password: "Test12",
    });

    expect(user.password).toBeUndefined();
    expect(user.role).toBe("member");
    expect(user.name).toBe("Deneme Kullanıcı");
  });

  it("var olan e-postayla kayda izin vermez (backend 409)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse(
          {
            title: "Kaynak çakışması",
            status: 409,
            detail: "Bu e-posta adresi zaten kayıtlı.",
          },
          409
        )
      )
    );

    await expect(
      authService.register({
        firstName: "Tekrar",
        lastName: "Deneme",
        email: "berke@cineseat.com",
        username: "authservicetest2",
        password: "Test12",
      })
    ).rejects.toThrow("Bu e-posta adresi zaten kayıtlı.");
  });

  it("var olan kullanıcı adıyla kayda izin vermez (backend 409)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        jsonResponse(
          {
            title: "Kaynak çakışması",
            status: 409,
            detail: "Bu kullanıcı adı zaten alınmış.",
          },
          409
        )
      )
    );

    await expect(
      authService.register({
        firstName: "Tekrar",
        lastName: "Deneme",
        email: "authservice.test.3@cineseat.com",
        username: "berke",
        password: "Test12",
      })
    ).rejects.toThrow("Bu kullanıcı adı zaten alınmış.");
  });
});
