import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import AuthProvider from "../../context/AuthProvider.jsx";
import ThemeProvider from "../../context/ThemeProvider.jsx";
import Layout from "./Layout.jsx";

function renderLayout(initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <ThemeProvider>
          <CartProvider>
            <AuthProvider>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<p>Ana sayfa içeriği</p>} />
                </Route>
              </Routes>
            </AuthProvider>
          </CartProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Layout", () => {
  it("skip link, header, sayfa içeriği ve footer'ı birlikte render eder", () => {
    renderLayout();

    expect(
      screen.getByRole("link", { name: "İçeriğe geç" })
    ).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Ana sayfa içeriği")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("aktif temayı body yerine <html> üzerine uygular", () => {
    renderLayout();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.body.dataset.theme).toBeUndefined();
  });
});
