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
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import CartProvider from "../context/CartProvider.jsx";
import AuthProvider from "../context/AuthProvider.jsx";
import RegisterPage from "./RegisterPage.jsx";

function renderRegisterPage() {
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <CartProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<p>Ana sayfa</p>} />
            <Route
              path="/register"
              element={<RegisterPage />}
            />
          </Routes>
        </AuthProvider>
      </CartProvider>
    </MemoryRouter>
  );
}

function fillRequiredFields({
  firstName = "Test",
  lastName = "Kullanıcı",
  email = "yeni.kullanici@cineseat.com",
  username = "yenikullanici",
  password = "Test12",
  passwordConfirm = "Test12",
} = {}) {
  fireEvent.change(screen.getByLabelText("Ad *"), {
    target: { value: firstName },
  });
  fireEvent.change(screen.getByLabelText("Soyad *"), {
    target: { value: lastName },
  });
  fireEvent.change(screen.getByLabelText("E-posta *"), {
    target: { value: email },
  });
  fireEvent.change(
    screen.getByLabelText("Kullanıcı Adı *"),
    { target: { value: username } }
  );
  fireEvent.change(screen.getByLabelText("Şifre *"), {
    target: { value: password },
  });
  fireEvent.change(
    screen.getByLabelText("Şifre (Tekrar) *"),
    { target: { value: passwordConfirm } }
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("zorunlu alanlar boşken alan bazlı hatalar gösterir, kayıt denemez", () => {
    renderRegisterPage();

    fireEvent.click(
      screen.getByRole("button", { name: "Kayıt Ol" })
    );

    expect(
      screen.getByText("Ad zorunludur.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Soyad zorunludur.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("E-posta zorunludur.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Kullanıcı adı zorunludur.")
    ).toBeInTheDocument();
  });

  it("şifreler eşleşmezse hata gösterir", () => {
    renderRegisterPage();

    fillRequiredFields({ passwordConfirm: "FarkliSifre1" });

    fireEvent.click(
      screen.getByRole("button", { name: "Kayıt Ol" })
    );

    expect(
      screen.getByText("Şifreler eşleşmiyor.")
    ).toBeInTheDocument();
  });

  it("var olan e-posta ile kayıt denenirse benzersizlik hatası gösterir", async () => {
    // authService artık backend'e (fetch) gidiyor — bu test backend'in
    // gerçekte döndürdüğü 409 şeklini taklit eder, ağa çıkmaz.
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 409,
          json: () =>
            Promise.resolve({
              title: "Kaynak çakışması",
              status: 409,
              detail: "Bu e-posta adresi zaten kayıtlı.",
            }),
        })
      )
    );

    renderRegisterPage();

    fillRequiredFields({
      email: "berke@cineseat.com",
      username: "yepyeniadi",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Kayıt Ol" })
    );

    expect(
      await screen.findByText(
        "Bu e-posta adresi zaten kayıtlı."
      )
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("geçerli bilgilerle kayıt olunca otomatik giriş yapar ve ana sayfaya yönlendirir", async () => {
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
                id: 99,
                name: "Test",
                surname: "Kullanıcı",
                username: "yeniuye",
                email: "yeni.uye@cineseat.com",
                role: "User",
              },
            }),
        })
      )
    );

    renderRegisterPage();

    fillRequiredFields({
      email: "yeni.uye@cineseat.com",
      username: "yeniuye",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Kayıt Ol" })
    );

    expect(
      await screen.findByText("Ana sayfa")
    ).toBeInTheDocument();

    const storedUser = JSON.parse(
      sessionStorage.getItem("cineseat_user")
    );

    expect(storedUser.email).toBe(
      "yeni.uye@cineseat.com"
    );
    expect(storedUser.role).toBe("member");
    expect(storedUser.password).toBeUndefined();

    vi.unstubAllGlobals();
  });
});
