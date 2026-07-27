import { Route, Routes } from "react-router-dom";

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

import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminMoviesPage from "./pages/admin/AdminMoviesPage.jsx";
import AdminMovieForm from "./pages/admin/AdminMovieForm.jsx";
import CinemasPage from "./pages/CinemasPage.jsx";
import ProtectedRoute from "./components/routing/ProtectedRoute.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import "./App.css";

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
        <Route path="/odeme" element={<PaymentPage />} />
        <Route path="/odeme-hata" element={<PaymentErrorPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cinemas" element={<CinemasPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Üye ve Admin görebilir */}
        <Route element={<ProtectedRoute allowedRoles={["member", "admin"]} />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={["admin"]} />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMoviesPage />} />
          <Route path="movies/new" element={<AdminMovieForm />} />
          <Route path="movies/:id" element={<AdminMovieForm />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;