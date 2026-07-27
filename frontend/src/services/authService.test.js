import { describe, expect, it } from "vitest";

import { authService } from "./authService.js";

describe("authService.login", () => {
  it("doğru bilgilerle şifresi olmayan kullanıcı objesi döner", async () => {
    const user = await authService.login(
      "berke@cineseat.com",
      "Test12"
    );

    expect(user.email).toBe("berke@cineseat.com");
    expect(user.password).toBeUndefined();
  });

  it("yanlış bilgilerle genel bir hata fırlatır (REQ-21)", async () => {
    await expect(
      authService.login(
        "berke@cineseat.com",
        "yanlisSifre"
      )
    ).rejects.toThrow("E-posta veya şifre hatalı.");
  });
});

describe("authService.register", () => {
  it("yeni kullanıcıyı şifresiz döner ve role her zaman member olur", async () => {
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

  it("var olan e-postayla kayda izin vermez", async () => {
    await expect(
      authService.register({
        firstName: "Tekrar",
        lastName: "Deneme",
        email: "berke@cineseat.com",
        username: "authservicetest2",
        password: "Test12",
      })
    ).rejects.toThrow(
      "Bu e-posta adresi zaten kayıtlı."
    );
  });

  it("var olan kullanıcı adıyla kayda izin vermez", async () => {
    await expect(
      authService.register({
        firstName: "Tekrar",
        lastName: "Deneme",
        email: "authservice.test.3@cineseat.com",
        username: "berke",
        password: "Test12",
      })
    ).rejects.toThrow(
      "Bu kullanıcı adı zaten kullanılıyor."
    );
  });
});
