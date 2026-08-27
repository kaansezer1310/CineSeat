import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PERMISSIONS } from "../../constants/permissions.js";
import MobileMenu from "./MobileMenu.jsx";

const mockLogout = vi.fn();
let mockUser = null;

vi.mock("../../hooks/useAuth.js", () => ({
  default: () => ({
    user: mockUser,
    logout: mockLogout,
    hasPermission: (permission) =>
      (mockUser?.permissions ?? []).includes(permission),
  }),
}));

function renderMenu() {
  render(
    <MemoryRouter>
      <MobileMenu />
    </MemoryRouter>
  );
}

describe("MobileMenu", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("panel kapalı başlar", () => {
    mockUser = null;
    renderMenu();

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("tetikleyiciye tıklayınca nav linklerini gösterir", () => {
    mockUser = null;
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));

    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("href", "/movies");
    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("href", "/cinemas");
    expect(
      screen.getByRole("link", { name: "Giriş Yap" })
    ).toBeInTheDocument();
  });

  it("misafire Yönetim bağlantısı göstermez", () => {
    mockUser = null;
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("yetkili kullanıcıya Yönetim bağlantısı gösterir", () => {
    mockUser = {
      id: 1,
      name: "Yönetici",
      permissions: [PERMISSIONS.RESERVATION_READ],
    };
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));

    expect(
      screen.getByRole("link", { name: "Yönetim" })
    ).toHaveAttribute("href", "/admin");
  });

  it("giriş yapmış kullanıcıya Çıkış butonunu gösterir, tıklayınca logout çağrılır ve panel kapanır", () => {
    mockUser = { id: 1, name: "Ayşe", permissions: [] };
    mockLogout.mockClear();
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    fireEvent.click(screen.getByRole("button", { name: "Çıkış" }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("Escape ile kapanır", () => {
    mockUser = null;
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("açıkken body scroll'unu kilitler, kapanınca serbest bırakır", () => {
    mockUser = null;
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Menüyü kapat" }));
    expect(document.body.style.overflow).toBe("");
  });
});
