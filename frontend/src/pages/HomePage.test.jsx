import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import movieService from "../services/movieService.js";
import { cityResource } from "../services/locationService.js";
import HomePage from "./HomePage.jsx";

vi.mock("../services/movieService.js", async () => {
  const actual = await vi.importActual("../services/movieService.js");
  return { default: { ...actual.default, getMovies: vi.fn() } };
});

vi.mock("../services/locationService.js", () => ({
  cityResource: { list: vi.fn() },
}));

function isoDateOffsetFromToday(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const MOVIES = [
  {
    id: 1,
    title: "Neon Yağmuru",
    genre: "Cyberpunk Dram",
    poster: "/posters/neon-yagmuru.png",
    releaseDate: isoDateOffsetFromToday(-3),
    rating: { average: 4.5 },
  },
  {
    id: 2,
    title: "Yanlış Düğün",
    genre: "Komedi",
    poster: "/posters/yanlis-dugun.png",
    releaseDate: isoDateOffsetFromToday(-10),
    rating: { average: 3.5 },
  },
];

const CITIES = [
  { id: 1, name: "İstanbul" },
  { id: 2, name: "Ankara" },
];

function renderHomePage(initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/movies/:movieId"
            element={<div>Film detay sayfası</div>}
          />
          <Route path="/cinemas" element={<div>Sinemalar sayfası</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("HomePage — Hero ve hızlı bilet şeridi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    movieService.getMovies.mockResolvedValue(MOVIES);
    cityResource.list.mockResolvedValue(CITIES);
  });

  it("başlığı ve Bilet Al CTA'sını gösterir", async () => {
    renderHomePage();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /Bileti telefonundan al/,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Bilet Al" })
    ).toHaveAttribute("href", "/movies");
  });

  it("film ve şehir sayısını güven rakamı olarak gösterir", async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByTestId("hero-stat-movies")).toHaveTextContent("2");
    });
    expect(screen.getByTestId("hero-stat-cities")).toHaveTextContent("2");
  });

  it("vizyondaki en yüksek puanlı filmleri poster yelpazesinde gösterir", async () => {
    const { container } = renderHomePage();

    await waitFor(() => {
      expect(container.querySelectorAll(".hero-poster")).toHaveLength(2);
    });

    const heroPosters = container.querySelectorAll(".hero-poster");

    expect(heroPosters[0]).toHaveAttribute(
      "src",
      "/posters/neon-yagmuru.png"
    );
  });

  it("hızlı bilet şeridinde film seçilip Seansları Bul'a basılınca film detayına gider", async () => {
    renderHomePage();

    const movieSelect = await screen.findByLabelText("Film");
    await screen.findByRole("option", { name: "Neon Yağmuru" });
    fireEvent.change(movieSelect, { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: "Seansları Bul" }));

    expect(await screen.findByText("Film detay sayfası")).toBeInTheDocument();
  });

  it("hızlı bilet şeridinde yalnızca şehir seçilirse Sinemalar sayfasına gider", async () => {
    renderHomePage();

    const citySelect = await screen.findByLabelText("Şehir");
    await screen.findByRole("option", { name: "İstanbul" });
    fireEvent.change(citySelect, { target: { value: "İstanbul" } });

    fireEvent.click(screen.getByRole("button", { name: "Seansları Bul" }));

    expect(
      await screen.findByText("Sinemalar sayfası")
    ).toBeInTheDocument();
  });
});
