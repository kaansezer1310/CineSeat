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
import { PERMISSIONS } from "../../constants/permissions.js";

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
                guard ?? (
                  <ProtectedRoute
                    requiredPermissions={[PERMISSIONS.MOVIE_MANAGE]}
                  />
                )
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

function signIn({ role = "member", permissions } = {}) {
  sessionStorage.setItem(
    "cineseat_user",
    JSON.stringify({
      id: 1,
      name: "Test Kullanıcı",
      email: "test@cineseat.com",
      role,
      ...(permissions ? { permissions } : {}),
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

  it("gerekli izni olmayan kullanıcıyı 403 sayfasına gönderir", () => {
    signIn({ permissions: [PERMISSIONS.COMMENT_MODERATE] });

    // Login'e geri atmak, giriş yapmış kullanıcı için döngü üretir ve
    // sebebi anlatmaz; bu yüzden ayrı bir 403 ekranı var.
    renderProtectedAdminRoute();

    expect(screen.getByText("Yetkisiz sayfası")).toBeInTheDocument();
    expect(
      screen.queryByText("Admin içeriği")
    ).not.toBeInTheDocument();
  });

  it("gerekli izne sahip kullanıcıya rolünden bağımsız olarak içeriği gösterir", () => {
    signIn({ role: "member", permissions: [PERMISSIONS.MOVIE_MANAGE] });

    renderProtectedAdminRoute();

    expect(
      screen.getByText("Admin içeriği")
    ).toBeInTheDocument();
  });

  it("izinsiz admin rolüne erişim vermez", () => {
    // Yetki artık rolden türetilmiyor: izin listesi neyse o geçerli.
    signIn({ role: "admin", permissions: [] });

    renderProtectedAdminRoute();

    expect(screen.getByText("Yetkisiz sayfası")).toBeInTheDocument();
  });

  it("permissionMode 'all' varsayılanında izinlerin tamamını arar", () => {
    signIn({ permissions: [PERMISSIONS.MOVIE_MANAGE] });

    renderProtectedAdminRoute(
      <ProtectedRoute
        requiredPermissions={[
          PERMISSIONS.MOVIE_MANAGE,
          PERMISSIONS.GENRE_MANAGE,
        ]}
      />
    );

    expect(screen.getByText("Yetkisiz sayfası")).toBeInTheDocument();
  });

  it("permissionMode 'any' ile tek izin yeterlidir", () => {
    signIn({ permissions: [PERMISSIONS.MOVIE_MANAGE] });

    renderProtectedAdminRoute(
      <ProtectedRoute
        requiredPermissions={[
          PERMISSIONS.MOVIE_MANAGE,
          PERMISSIONS.GENRE_MANAGE,
        ]}
        permissionMode="any"
      />
    );

    expect(
      screen.getByText("Admin içeriği")
    ).toBeInTheDocument();
  });

  it("rol tabanlı koruma çalışmaya devam eder", () => {
    signIn({ role: "member" });

    renderProtectedAdminRoute(
      <ProtectedRoute allowedRoles={["admin"]} />
    );

    expect(screen.getByText("Yetkisiz sayfası")).toBeInTheDocument();
  });
});
