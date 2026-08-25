import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import AuthProvider from "../../context/AuthProvider.jsx";
import ToastProvider from "../../context/ToastProvider.jsx";
import userService from "../../services/userService.js";
import AdminUsersPage from "./AdminUsersPage.jsx";

vi.mock("../../services/userService.js", () => ({
  default: {
    list: vi.fn(),
    listRoles: vi.fn(),
    changeRole: vi.fn(),
  },
}));

const ROLES = [
  { id: 1, name: "Admin" },
  { id: 2, name: "User" },
];

const USERS = [
  {
    id: 1,
    username: "admin",
    name: "Sistem Yöneticisi",
    email: "admin@cineseat.com",
    roleId: 1,
    roleName: "Admin",
    memberSince: "2026-08-01T10:00:00+03:00",
    reservationCount: 0,
  },
  {
    id: 4,
    username: "berke",
    name: "Berke Kuş",
    email: "berke@cineseat.com",
    roleId: 2,
    roleName: "User",
    memberSince: "2026-08-10T10:00:00+03:00",
    reservationCount: 3,
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  // Oturumdaki kullanıcı admin (id 1) — kendi satırında rol seçimi olmamalı.
  sessionStorage.setItem(
    "cineseat_user",
    JSON.stringify({ id: 1, name: "Sistem", role: "admin" })
  );

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CartProvider>
          <AuthProvider>
            <ToastProvider>
              <AdminUsersPage />
            </ToastProvider>
          </AuthProvider>
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("AdminUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    userService.listRoles.mockResolvedValue(ROLES);
    userService.list.mockResolvedValue({ items: USERS, totalCount: 2 });
    userService.changeRole.mockResolvedValue(null);
  });

  it("kullanıcıları listeler", async () => {
    renderPage();

    expect(await screen.findByText("berke")).toBeInTheDocument();
    expect(screen.getByText("Berke Kuş")).toBeInTheDocument();
  });

  it("oturumdaki kullanıcıya rol seçimi sunmaz", async () => {
    // Backend de reddediyor; arayüzde hiç teklif etmemek daha dürüst.
    renderPage();

    await screen.findByText("berke");

    expect(screen.getByText("Admin (siz)")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("admin kullanıcısının rolü")
    ).not.toBeInTheDocument();
  });

  it("başka kullanıcı için rol seçimi sunar", async () => {
    renderPage();

    await screen.findByText("berke");

    expect(
      screen.getByLabelText("berke kullanıcısının rolü")
    ).toHaveValue("2");
  });

  it("rol değişimi önce onay ister, hemen istek atmaz", async () => {
    renderPage();

    await screen.findByText("berke");

    fireEvent.change(screen.getByLabelText("berke kullanıcısının rolü"), {
      target: { value: "1" },
    });

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("berke");
    expect(userService.changeRole).not.toHaveBeenCalled();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Rolü Değiştir" })
    );

    await waitFor(() => {
      expect(userService.changeRole).toHaveBeenCalledWith(4, 1);
    });
  });

  it("vazgeçilirse rol değişmez", async () => {
    renderPage();

    await screen.findByText("berke");

    fireEvent.change(screen.getByLabelText("berke kullanıcısının rolü"), {
      target: { value: "1" },
    });

    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Vazgeç" }));

    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument();
    });
    expect(userService.changeRole).not.toHaveBeenCalled();
  });

  it("arama metnini sunucuya gönderir", async () => {
    renderPage();

    await screen.findByText("berke");

    fireEvent.change(screen.getByLabelText("Ara"), {
      target: { value: "berke" },
    });

    await waitFor(() => {
      expect(userService.list).toHaveBeenCalledWith({
        search: "berke",
        roleId: "",
      });
    });
  });
});
