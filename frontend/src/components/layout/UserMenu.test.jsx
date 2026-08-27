import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import UserMenu from "./UserMenu.jsx";

const mockLogout = vi.fn();
let mockUser = null;

vi.mock("../../hooks/useAuth.js", () => ({
  default: () => ({ user: mockUser, logout: mockLogout }),
}));

function renderUserMenu() {
  render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>
  );
}

describe("UserMenu", () => {
  it("misafire Giriş Yap ve Kayıt Ol bağlantılarını gösterir", () => {
    mockUser = null;
    renderUserMenu();

    expect(
      screen.getByRole("link", { name: "Giriş Yap" })
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("link", { name: "Kayıt Ol" })
    ).toHaveAttribute("href", "/register");
  });

  it("giriş yapmış kullanıcıya isim düğmesini gösterir, panel kapalı başlar", () => {
    mockUser = { id: 1, name: "Ayşe" };
    renderUserMenu();

    expect(
      screen.getByRole("button", { name: /Ayşe/ })
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("düğmeye tıklayınca Profilim ve Çıkış içeren panel açılır", () => {
    mockUser = { id: 1, name: "Ayşe" };
    renderUserMenu();

    fireEvent.click(screen.getByRole("button", { name: /Ayşe/ }));

    expect(
      screen.getByRole("menuitem", { name: "Profilim" })
    ).toHaveAttribute("href", "/profile");
    expect(
      screen.getByRole("menuitem", { name: "Çıkış" })
    ).toBeInTheDocument();
  });

  it("Çıkış'a tıklayınca logout çağrılır ve panel kapanır", () => {
    mockUser = { id: 1, name: "Ayşe" };
    mockLogout.mockClear();
    renderUserMenu();

    fireEvent.click(screen.getByRole("button", { name: /Ayşe/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Çıkış" }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });
});
