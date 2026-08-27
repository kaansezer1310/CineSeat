import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import AuthProvider from "../../context/AuthProvider.jsx";
import ThemeProvider from "../../context/ThemeProvider.jsx";
import {
  ADMIN_PERMISSIONS,
  PERMISSIONS,
} from "../../constants/permissions.js";
import Header from "./Header.jsx";

// Header, CitySelector'ı render eder ve CitySelector cityResource.list()'i
// (gerçek bir HTTP isteği) çağırır — bu testler ağdan bağımsız kalsın diye
// mock'lanıyor (CitySelector.test.jsx'teki aynı desen).
vi.mock("../../services/locationService.js", () => ({
  cityResource: { list: () => Promise.resolve([]) },
}));

function renderHeader(initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <ThemeProvider>
          <CartProvider>
            <AuthProvider>
              <Routes>
                <Route path="*" element={<Header />} />
              </Routes>
            </AuthProvider>
          </CartProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function signIn(user) {
  sessionStorage.setItem("cineseat_user", JSON.stringify(user));
}

describe("Header", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("logo ana sayfaya bağlanır", () => {
    renderHeader();

    expect(
      screen.getByRole("link", { name: "CineSeat" })
    ).toHaveAttribute("href", "/");
  });

  it("üç ana nav öğesini gösterir", () => {
    renderHeader();

    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("href", "/movies");
    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("href", "/cinemas");
    expect(
      screen.getByRole("link", { name: "Kampanyalar" })
    ).toHaveAttribute("href", "/campaigns");
  });

  it("aktif sayfayı aria-current ile işaretler", () => {
    renderHeader("/cinemas");

    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).not.toHaveAttribute("aria-current");
  });

  it("misafire Yönetim bağlantısı göstermez", () => {
    renderHeader();

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("izni olmayan üyeye Yönetim bağlantısı göstermez", () => {
    signIn({ id: 2, name: "Üye", role: "member" });
    renderHeader();

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
    renderHeader();

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
    renderHeader();

    expect(
      screen.getByRole("link", { name: "Yönetim" })
    ).toBeInTheDocument();
  });

  it("izinsiz admin rolüne Yönetim bağlantısı göstermez", () => {
    signIn({ id: 1, name: "Yönetici", role: "admin", permissions: [] });
    renderHeader();

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("araç çubuğunda tema, sepet ve hesap kontrollerini render eder", () => {
    renderHeader();

    expect(
      screen.getByRole("button", { name: "Koyu temaya geç" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sepet" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Giriş Yap" })
    ).toBeInTheDocument();
  });

  it("mobil menü tetikleyicisini render eder", () => {
    renderHeader();

    expect(
      screen.getByRole("button", { name: "Menüyü aç" })
    ).toBeInTheDocument();
  });

  it("bir film detay sayfasındayken Filmler bağlantısını aktif işaretler", () => {
    renderHeader("/movies/42");

    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("aria-current", "page");
  });
});
