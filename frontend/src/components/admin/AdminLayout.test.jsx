import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import AuthProvider from "../../context/AuthProvider.jsx";
import AdminLayout from "./AdminLayout.jsx";
import {
  ADMIN_PERMISSIONS,
  PERMISSIONS,
} from "../../constants/permissions.js";

function renderAdminLayout(initialPath = "/admin") {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <CartProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<p>Site ana sayfası</p>} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<p>İstatistik içeriği</p>} />
              <Route path="movies" element={<p>Film içeriği</p>} />
            </Route>
          </Routes>
        </AuthProvider>
      </CartProvider>
    </MemoryRouter>
  );
}

function signIn(user) {
  sessionStorage.setItem("cineseat_user", JSON.stringify(user));
}

describe("AdminLayout", () => {
  beforeEach(() => {
    sessionStorage.clear();
    signIn({
      id: 1,
      name: "Yönetici Kullanıcı",
      role: "admin",
      permissions: [...ADMIN_PERMISSIONS],
    });
  });

  // K3: panele giren kullanıcının tarayıcı geri tuşundan başka çıkışı yoktu.
  it("siteye dönüş ve çıkış yolu sunar", () => {
    renderAdminLayout();

    expect(
      screen.getByRole("link", { name: /Siteye Dön/ })
    ).toHaveAttribute("href", "/");

    expect(
      screen.getByRole("button", { name: "Çıkış" })
    ).toBeInTheDocument();
  });

  it("üst çubukta oturumdaki kullanıcıyı gösterir", () => {
    renderAdminLayout();

    expect(
      screen.getByText("Yönetici Kullanıcı")
    ).toBeInTheDocument();
  });

  it("menüyü bölümlere ayırır", () => {
    renderAdminLayout();

    const menu = screen.getByRole("navigation", {
      name: "Yönetim menüsü",
    });

    expect(
      within(menu).getByRole("heading", { name: "Raporlar" })
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("heading", { name: "Katalog" })
    ).toBeInTheDocument();
  });

  it("aktif menü öğesini işaretler", () => {
    renderAdminLayout("/admin/movies");

    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("aria-current", "page");

    // `end` sayesinde /admin bağlantısı alt rotalarda aktif görünmez.
    expect(
      screen.getByRole("link", { name: "İstatistikler" })
    ).not.toHaveAttribute("aria-current");
  });

  it("izni olmayan bölümü hiç render etmez", () => {
    signIn({
      id: 5,
      name: "Rapor Kullanıcısı",
      role: "member",
      permissions: [PERMISSIONS.RESERVATION_READ],
    });

    renderAdminLayout();

    expect(
      screen.getByRole("link", { name: "İstatistikler" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Filmler" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Katalog" })
    ).not.toBeInTheDocument();
  });
});
