import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import MovieDetailsPage from "./pages/MovieDetailsPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import PaymentErrorPage from "./pages/PaymentErrorPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CinemasPage from "./pages/CinemasPage.jsx";
import ProtectedRoute from "./components/routing/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ForbiddenPage from "./pages/ForbiddenPage.jsx";
import { ADMIN_PERMISSIONS, PERMISSIONS } from "./constants/permissions.js";

import "./App.css";

// O2 / Faz 5: yönetim paneli ve yalnızca orada kullanılan ağır bağımlılıklar
// (recharts, react-csv) ayrı parçaya iniyor; siteye giren normal ziyaretçi
// bunları indirmiyor.
const AdminLayout = lazy(() =>
  import("./components/admin/AdminLayout.jsx")
);
const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard.jsx")
);
const AdminMoviesPage = lazy(() =>
  import("./pages/admin/AdminMoviesPage.jsx")
);
const AdminMovieForm = lazy(() =>
  import("./pages/admin/AdminMovieForm.jsx")
);
const AdminNotFoundPage = lazy(() =>
  import("./pages/admin/AdminNotFoundPage.jsx")
);

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/movies/:movieId"
          element={<MovieDetailsPage />}
        />

        <Route
          path="/booking/:sessionId"
          element={<BookingPage />}
        />

        <Route path="/cart" element={<CartPage />} />

        {/* T8: kanonik ödeme rotaları İngilizce. Eski Türkçe adresler
            paylaşılmış/yer imlenmiş olabilir, o yüzden silinmiyor —
            kalıcı yönlendirme olarak korunuyor. */}
        {/* Rezervasyon uçları kimlik doğrulaması istiyor (backend
            ReservationsController → [Authorize]); misafir ödeme akışına
            girerse formu doldurup 401 alırdı. Bu yüzden ödeme rotaları
            korumalı: giriş sonrası kullanıcı buraya geri döner. */}
        <Route element={<ProtectedRoute allowedRoles={["member", "admin"]} />}>
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-error" element={<PaymentErrorPage />} />
        </Route>
        <Route
          path="/odeme"
          element={<Navigate to="/payment" replace />}
        />
        <Route
          path="/odeme-hata"
          element={<Navigate to="/payment-error" replace />}
        />

        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cinemas" element={<CinemasPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* Üye ve Admin görebilir */}
        <Route element={<ProtectedRoute allowedRoles={["member", "admin"]} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Panele giriş: yönetim izinlerinden en az biri yeterli.
          Ekran bazlı yetki her alt ağaçta ayrıca kontrol ediliyor. */}
      <Route
        element={
          <ProtectedRoute
            requiredPermissions={ADMIN_PERMISSIONS}
            permissionMode="any"
          />
        }
      >
        <Route
          path="/admin"
          element={
            <Suspense
              fallback={
                <div className="route-fallback">
                  Yönetim paneli yükleniyor…
                </div>
              }
            >
              <AdminLayout />
            </Suspense>
          }
        >
          <Route
            element={
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.RESERVATION_READ]}
              />
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route
            element={
              <ProtectedRoute
                requiredPermissions={[PERMISSIONS.MOVIE_MANAGE]}
              />
            }
          >
            <Route path="movies" element={<AdminMoviesPage />} />
            <Route path="movies/new" element={<AdminMovieForm />} />
            <Route path="movies/:id" element={<AdminMovieForm />} />
          </Route>

          {/* O5: admin ağacının kendi 404'ü */}
          <Route path="*" element={<AdminNotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
