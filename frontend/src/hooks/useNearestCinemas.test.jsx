import { render, screen, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import cinemaService from "../services/cinemaService.js";
import useNearestCinemas from "./useNearestCinemas.js";

vi.mock("../services/cinemaService.js", () => ({
  default: { getCinemas: vi.fn() },
}));

const CINEMAS = [
  { id: 1, name: "Uzak Sinema", city: "İstanbul", lat: 41.5, lng: 29.5 },
  { id: 2, name: "Yakın Sinema", city: "İstanbul", lat: 40.98, lng: 29.02 },
];

function Harness() {
  const { cinemas, isLoading, locationStatus, hasLocation } =
    useNearestCinemas();

  if (isLoading) {
    return <p>Yükleniyor</p>;
  }

  return (
    <div>
      <p data-testid="status">{locationStatus}</p>
      <p data-testid="has-location">{String(hasLocation)}</p>
      <ul>
        {cinemas.map((cinema) => (
          <li key={cinema.id}>{cinema.name}</li>
        ))}
      </ul>
    </div>
  );
}

function renderHarness() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>
  );
}

describe("useNearestCinemas", () => {
  const originalGeolocation = navigator.geolocation;

  beforeEach(() => {
    vi.clearAllMocks();
    cinemaService.getCinemas.mockResolvedValue(CINEMAS);
  });

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
    });
  });

  it("konum API'si yoksa tüm sinemaları ham sırayla döner", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });

    renderHarness();

    expect(await screen.findByTestId("status")).toHaveTextContent(
      "Tarayıcınız konum özelliğini desteklemiyor. Şehir seçerek sinemaları görebilirsiniz."
    );
    expect(screen.getByTestId("has-location")).toHaveTextContent("false");
    expect(
      screen.getAllByRole("listitem").map((el) => el.textContent)
    ).toEqual(["Uzak Sinema", "Yakın Sinema"]);
  });

  it("konum izni verilince sinemaları mesafeye göre sıralar", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success) => {
          success({ coords: { latitude: 40.9819, longitude: 29.0233 } });
        },
      },
      configurable: true,
    });

    renderHarness();

    await waitFor(() =>
      expect(screen.getByTestId("has-location")).toHaveTextContent("true")
    );
    expect(
      screen.getAllByRole("listitem").map((el) => el.textContent)
    ).toEqual(["Yakın Sinema", "Uzak Sinema"]);
  });

  it("konum izni reddedilince kullanıcıyı bilgilendirir", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (_success, failure) => {
          failure(new Error("denied"));
        },
      },
      configurable: true,
    });

    renderHarness();

    expect(await screen.findByTestId("status")).toHaveTextContent(
      "Konum izni verilmedi. Tüm sinemalar listeleniyor, dilerseniz şehir seçerek daraltabilirsiniz."
    );
  });
});
