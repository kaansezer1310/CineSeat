import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import CartProvider from "../context/CartProvider.jsx";
import AuthProvider from "../context/AuthProvider.jsx";
import LoginPage from "./LoginPage.jsx";

function renderLoginPage(locationState = null) {
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/login", state: locationState }]}
    >
      <CartProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<p>Ana sayfa</p>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<p>Profil sayfası</p>} />
          </Routes>
        </AuthProvider>
      </CartProvider>
    </MemoryRouter>
  );
}

// Korumalı bir sayfadan yönlendirilen kullanıcının taşıdığı state.
const REDIRECTED_FROM_PROFILE = {
  from: { pathname: "/profile", search: "" },
  reason: "login-required",
};

describe("LoginPage — zaten giriş yapmış kullanıcı yönlendirmesi", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("render sırasında React'in 'setState during render' uyarısını tetiklemeden ana sayfaya yönlendirir", () => {
    sessionStorage.setItem(
      "cineseat_user",
      JSON.stringify({
        id: 4,
        name: "Berke",
        email: "berke@cineseat.com",
        role: "member",
      })
    );

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderLoginPage();

    expect(screen.getByText("Ana sayfa")).toBeInTheDocument();

    const routerWarning = consoleErrorSpy.mock.calls.some(
      (call) => {
        return call.some((arg) => {
          return (
            typeof arg === "string" &&
            arg.includes(
              "Cannot update a component"
            )
          );
        });
      }
    );

    expect(routerWarning).toBe(false);
  });
});

describe("LoginPage — giriş akışı", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("boş alanlarla gönderimde hata gösterir, giriş denemez", async () => {
    renderLoginPage();

    const submitBtn = screen.getByRole("button", {
      name: /Giriş Yap/i,
    });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("E-posta zorunludur.")
    ).toBeInTheDocument();
    
    expect(
      await screen.findByText("Şifre zorunludur.")
    ).toBeInTheDocument();
  });

  it("yanlış bilgiyle REQ-21'e uygun genel hata mesajı gösterir", async () => {
    // authService artık backend'e (fetch) gidiyor — bu test backend'in
    // gerçekte döndürdüğü 401 şeklini taklit eder, ağa çıkmaz.
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () =>
            Promise.resolve({
              title: "Yetkisiz erişim",
              status: 401,
              detail: "E-posta veya şifre hatalı.",
            }),
        })
      )
    );

    renderLoginPage();

    fireEvent.change(
      screen.getByLabelText("E-posta"),
      { target: { value: "olmayan@cineseat.com" } }
    );
    fireEvent.change(screen.getByLabelText("Şifre"), {
      target: { value: "yanlisSifre" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Giriş Yap" })
    );

    expect(
      await screen.findByText(
        "E-posta veya şifre hatalı."
      )
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("doğru bilgiyle giriş yapınca ana sayfaya yönlendirir ve oturumu kaydeder", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              token: "fake-jwt-token",
              expiresAt: "2026-12-31T00:00:00Z",
              user: {
                id: 4,
                name: "Berke",
                surname: "Kuş",
                username: "berke",
                email: "berke@cineseat.com",
                role: "User",
              },
            }),
        })
      )
    );

    renderLoginPage();

    fireEvent.change(
      screen.getByLabelText("E-posta"),
      { target: { value: "berke@cineseat.com" } }
    );
    fireEvent.change(screen.getByLabelText("Şifre"), {
      target: { value: "Test12" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Giriş Yap" })
    );

    expect(
      await screen.findByText("Ana sayfa")
    ).toBeInTheDocument();

    const storedUser = JSON.parse(
      sessionStorage.getItem("cineseat_user")
    );

    expect(storedUser.email).toBe("berke@cineseat.com");
    expect(storedUser.password).toBeUndefined();

    vi.unstubAllGlobals();
  });
});

describe("LoginPage — Y2: hedefe geri dönüş", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("yönlendirilerek gelen kullanıcıya sebebini açıklar", () => {
    renderLoginPage(REDIRECTED_FROM_PROFILE);

    expect(
      screen.getByText(/önce giriş yapmalısınız/i)
    ).toBeInTheDocument();
  });

  it("doğrudan gelen kullanıcıya açıklama göstermez", () => {
    renderLoginPage();

    expect(
      screen.queryByText(/önce giriş yapmalısınız/i)
    ).not.toBeInTheDocument();
  });

  it("giriş sonrası ana sayfaya değil gelinen sayfaya döner", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              token: "fake-jwt-token",
              expiresAt: "2026-12-31T00:00:00Z",
              user: {
                id: 4,
                name: "Berke",
                surname: "Kuş",
                username: "berke",
                email: "berke@cineseat.com",
                role: "User",
              },
            }),
        })
      )
    );

    renderLoginPage(REDIRECTED_FROM_PROFILE);

    fireEvent.change(screen.getByLabelText("E-posta"), {
      target: { value: "berke@cineseat.com" },
    });
    fireEvent.change(screen.getByLabelText("Şifre"), {
      target: { value: "Test12" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));

    expect(
      await screen.findByText("Profil sayfası")
    ).toBeInTheDocument();
  });

  it("kayıt bağlantısına hedefi taşır", () => {
    renderLoginPage(REDIRECTED_FROM_PROFILE);

    expect(
      screen.getByRole("link", { name: "Kayıt Ol" })
    ).toHaveAttribute("href", "/register");
  });
});
