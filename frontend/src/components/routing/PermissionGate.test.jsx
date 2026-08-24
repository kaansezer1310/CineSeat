import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import AuthProvider from "../../context/AuthProvider.jsx";
import CartProvider from "../../context/CartProvider.jsx";
import PermissionGate from "./PermissionGate.jsx";

function renderGate(props = {}) {
  render(
    <CartProvider>
      <AuthProvider>
        <PermissionGate permissions={["movie.manage"]} {...props}>
          <button type="button">Film düzenle</button>
        </PermissionGate>
      </AuthProvider>
    </CartProvider>
  );
}

describe("PermissionGate", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("izni olmayan kullanıcıdan eylemi gizler", () => {
    renderGate();

    expect(screen.queryByRole("button", { name: "Film düzenle" })).not.toBeInTheDocument();
  });

  it("izni olan kullanıcıya eylemi gösterir", () => {
    sessionStorage.setItem(
      "cineseat_user",
      JSON.stringify({
        id: 1,
        role: "member",
        permissions: ["movie.manage"],
      })
    );

    renderGate();

    expect(screen.getByRole("button", { name: "Film düzenle" })).toBeInTheDocument();
  });

  it("any modunda izinlerden biri varsa eylemi gösterir", () => {
    sessionStorage.setItem(
      "cineseat_user",
      JSON.stringify({
        id: 1,
        role: "member",
        permissions: ["reservation.read"],
      })
    );

    renderGate({
      permissions: ["movie.manage", "reservation.read"],
      mode: "any",
    });

    expect(screen.getByRole("button", { name: "Film düzenle" })).toBeInTheDocument();
  });
});
