import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import AuthProvider from "../../context/AuthProvider.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { PERMISSIONS } from "../../domain/permissions.js";

// Yönlendirme sırasında taşınan `location.state`'i görünür kılan yardımcı;
// böylece "hedef saklandı mı" iddiası DOM üzerinden doğrulanabiliyor.
function LoginProbe() {
  const location = useLocation();

  return (
    <div>
      <p>Login sayfası</p>
      <p data-testid="from">{location.state?.from?.pathname ?? "-"}</p>
      <p data-testid="reason">{location.state?.reason ?? "-"}</p>
    </div>
  );
}

function renderProtectedAdminRoute(guard = null) {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <CartProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<p>Ana sayfa</p>} />
            <Route path="/login" element={<LoginProbe />} />
            <Route path="/forbidden" element={<p>Yetkisiz sayfası</p>} />

            <Route
              element={
                guard ?? <ProtectedRoute allowedRoles={["admin"]} />
              }
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

function signIn(role, extra = {}) {
  sessionStorage.setItem(
    "cineseat_user",
    JSON.stringify({
      id: 1,
      name: "Test Kullanıcı",
      email: "test@cineseat.com",
      role,
      ...extra,
    })
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

  it("giriş gerektiren yönlendirmede hedef sayfayı state içinde taşır", () => {
    renderProtectedAdminRoute();

    expect(screen.getByTestId("from")).toHaveTextContent("/admin");
    expect(screen.getByTestId("reason")).toHaveTextContent(
      "login-required"
    );
  });

  it("giriş yapmış ama yetkisi olmayan kullanıcıyı 403 sayfasına gönderir", () => {
    signIn("member");

    renderProtectedAdminRoute();

    // Login'e geri atmak döngü üretir ve kullanıcıya sebebi anlatmaz.
    expect(screen.getByText("Yetkisiz sayfası")).toBeInTheDocument();
    expect(
      screen.queryByText("Admin içeriği")
    ).not.toBeInTheDocument();
  });

  it("admin rolündeki kullanıcıya korumalı içeriği gösterir", () => {
    signIn("admin");

    renderProtectedAdminRoute();

    expect(
      screen.getByText("Admin içeriği")
    ).toBeInTheDocument();
  });

  it("gerekli izne sahip kullanıcıya izin korumalı içeriği gösterir", () => {
    signIn("member", { permissions: [PERMISSIONS.MOVIE_MANAGE] });

    renderProtectedAdminRoute(
      <ProtectedRoute
        requiredPermissions={[PERMISSIONS.MOVIE_MANAGE]}
      />
    );

    expect(
      screen.getByText("Admin içeriği")
    ).toBeInTheDocument();
  });

  it("izni olmayan kullanıcıyı izin korumalı rotadan 403'e gönderir", () => {
    signIn("member", { permissions: [PERMISSIONS.COMMENT_MODERATE] });

    renderProtectedAdminRoute(
      <ProtectedRoute
        requiredPermissions={[PERMISSIONS.MOVIE_MANAGE]}
      />
    );

    expect(screen.getByText("Yetkisiz sayfası")).toBeInTheDocument();
  });
});
