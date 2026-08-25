import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import AuthProvider from "../../context/AuthProvider.jsx";
import ThemeProvider from "../../context/ThemeProvider.jsx";
import Layout from "./Layout.jsx";
import {
  ADMIN_PERMISSIONS,
  PERMISSIONS,
} from "../../constants/permissions.js";

function renderLayout(initialPath = "/") {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<p>Ana sayfa içeriği</p>} />
                <Route path="/cinemas" element={<p>Sinemalar içeriği</p>} />
              </Route>
            </Routes>
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function signIn(user) {
  sessionStorage.setItem("cineseat_user", JSON.stringify(user));
}

describe("Layout ana menü", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  // K2: panele ulaşmanın tek yolu adres çubuğuna /admin yazmaktı.
  it("misafire Yönetim bağlantısı göstermez", () => {
    renderLayout();

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("izni olmayan üyeye Yönetim bağlantısı göstermez", () => {
    signIn({ id: 2, name: "Üye", role: "member" });

    renderLayout();

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("yönetim izni olan kullanıcıya Yönetim bağlantısı gösterir", () => {
    signIn({
      id: 3,
      name: "Moderatör",
      role: "member",
      permissions: [PERMISSIONS.COMMENT_MODERATE],
    });

    renderLayout();

    expect(
      screen.getByRole("link", { name: "Yönetim" })
    ).toHaveAttribute("href", "/admin");
  });

  it("tam yetkili kullanıcıya Yönetim bağlantısı gösterir", () => {
    signIn({
      id: 1,
      name: "Yönetici",
      role: "admin",
      permissions: [...ADMIN_PERMISSIONS],
    });

    renderLayout();

    expect(
      screen.getByRole("link", { name: "Yönetim" })
    ).toBeInTheDocument();
  });

  it("izinsiz admin rolüne Yönetim bağlantısı göstermez", () => {
    // Yetki artık rolden değil izin listesinden geliyor.
    signIn({ id: 1, name: "Yönetici", role: "admin", permissions: [] });

    renderLayout();

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  // Y4: projede hiç NavLink yoktu, aktif sayfa vurgulanmıyordu.
  it("aktif sayfayı aria-current ile işaretler", () => {
    renderLayout("/cinemas");

    const cinemasLink = screen.getByRole("link", { name: "Sinemalar" });
    const homeLink = screen.getByRole("link", {
      name: "Vizyondaki Filmler",
    });

    expect(cinemasLink).toHaveAttribute("aria-current", "page");
    expect(homeLink).not.toHaveAttribute("aria-current");
  });

  // T9: sinemalar artık ana sayfada sekme değil, menüden ulaşılan rota.
  it("kullanıcı adını profile giden bir bağlantı olarak gösterir", () => {
    signIn({
      id: 1,
      name: "Sistem",
      role: "Admin",
      permissions: [],
      token: "t",
    });

    renderLayout("/");

    // Onceden "Hosgeldin, X" tiklanmaz bir metindi ama baglantilarin
    // arasinda baglanti gibi duruyordu. Artik isim profilin kendi etiketi.
    const hesap = screen.getByRole("link", { name: /Profilim — Sistem/ });

    expect(hesap).toHaveAttribute("href", "/profile");
  });

  it("giriş yapmamış kullanıcıya hesap bağlantısı göstermez", () => {
    renderLayout("/");

    expect(
      screen.queryByRole("link", { name: /Profilim —/ })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Giriş Yap" })).toBeInTheDocument();
  });

  it("karşılama metnini ayrı bir öğe olarak bırakmaz", () => {
    signIn({
      id: 1,
      name: "Sistem",
      role: "Admin",
      permissions: [],
      token: "t",
    });

    renderLayout("/");

    // Ayni bilgiyi iki kez soyleyen olu metin geri gelmemeli.
    expect(screen.queryByText(/Hoşgeldin/)).not.toBeInTheDocument();
  });

  it("menüden /cinemas rotasına bağlantı verir", () => {
    renderLayout();

    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("href", "/cinemas");
  });
});
