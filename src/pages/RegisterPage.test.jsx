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
    renderRegisterPage();

    fillRequiredFields({
      email: "berke@cineseat.com",
      username: "yepyeni-kullanici-adi",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Kayıt Ol" })
    );

    expect(
      await screen.findByText(
        "Bu e-posta adresi zaten kayıtlı."
      )
    ).toBeInTheDocument();
  });

  it("geçerli bilgilerle kayıt olunca otomatik giriş yapar ve ana sayfaya yönlendirir", async () => {
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
  });
});
