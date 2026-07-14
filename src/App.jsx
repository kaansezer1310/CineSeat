import { Route, Routes } from "react-router-dom";

import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import MovieDetailsPage from "./pages/MovieDetailsPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";

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
        <Route path="/success" element={<SuccessPage />} />
      </Route>
    </Routes>
  );
}

export default App;