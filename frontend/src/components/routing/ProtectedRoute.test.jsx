import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import AuthProvider from "../../context/AuthProvider.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function renderProtectedAdminRoute() {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <CartProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<p>Ana sayfa</p>} />
            <Route path="/login" element={<p>Login sayfası</p>} />

            <Route
              element={<ProtectedRoute allowedRoles={["admin"]} />}
            >
              <Route
                path="/admin"
                element={<p>Admin içeriği</p>}
              />
            </Route>
          </Routes>
        </AuthProvider>
      </CartProvider>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("giriş yapmamış kullanıcıyı admin rotasından login sayfasına yönlendirir", () => {
    renderProtectedAdminRoute();

    expect(screen.getByText("Login sayfası")).toBeInTheDocument();
    expect(
      screen.queryByText("Admin içeriği")
    ).not.toBeInTheDocument();
  });

  it("member rolündeki kullanıcıyı admin rotasından login sayfasına yönlendirir", () => {
    sessionStorage.setItem(
      "cineseat_user",
      JSON.stringify({
        id: 2,
        name: "Kaan Sezer",
        email: "kaan@cineseat.com",
        role: "member",
      })
    );

    renderProtectedAdminRoute();

    expect(screen.getByText("Login sayfası")).toBeInTheDocument();
    expect(
      screen.queryByText("Admin içeriği")
    ).not.toBeInTheDocument();
  });

  it("admin rolündeki kullanıcıya korumalı içeriği gösterir", () => {
    sessionStorage.setItem(
      "cineseat_user",
      JSON.stringify({
        id: 1,
        name: "Ömer Faruk",
        email: "omer@cineseat.com",
        role: "admin",
      })
    );

    renderProtectedAdminRoute();

    expect(
      screen.getByText("Admin içeriği")
    ).toBeInTheDocument();
  });
});
