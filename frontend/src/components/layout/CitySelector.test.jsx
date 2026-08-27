import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import CitySelector from "./CitySelector.jsx";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/locationService.js", () => ({
  cityResource: {
    list: () =>
      Promise.resolve([
        { id: 1, name: "İstanbul" },
        { id: 2, name: "Ankara" },
      ]),
  },
}));

function renderCitySelector() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CitySelector />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("CitySelector", () => {
  it("panel kapalı başlar", () => {
    renderCitySelector();

    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("tetikleyiciye tıklayınca şehirleri listeler", async () => {
    renderCitySelector();

    fireEvent.click(screen.getByRole("button", { name: /Şehir Seç/ }));

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: "İstanbul" })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("menuitem", { name: "Ankara" })
    ).toBeInTheDocument();
  });

  it("bir şehir seçilince /cinemas'a state ile yönlendirir ve paneli kapatır", async () => {
    renderCitySelector();

    fireEvent.click(screen.getByRole("button", { name: /Şehir Seç/ }));

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: "İstanbul" })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("menuitem", { name: "İstanbul" }));

    expect(mockNavigate).toHaveBeenCalledWith("/cinemas", {
      state: { city: "İstanbul" },
    });
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });
});
