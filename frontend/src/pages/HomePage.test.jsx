import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import movieService from "../services/movieService.js";
import { cityResource } from "../services/locationService.js";
import cinemaService from "../services/cinemaService.js";
import HomePage from "./HomePage.jsx";

vi.mock("../services/movieService.js", async () => {
  const actual = await vi.importActual("../services/movieService.js");
  return { default: { ...actual.default, getMovies: vi.fn() } };
});

vi.mock("../services/locationService.js", () => ({
  cityResource: { list: vi.fn() },
}));

vi.mock("../services/cinemaService.js", () => ({
  default: { getCinemas: vi.fn() },
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
    cinemaService.getCinemas.mockResolvedValue([]);
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

describe("HomePage — Vizyondaki Filmler ve Yakında rayları", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cityResource.list.mockResolvedValue(CITIES);
    cinemaService.getCinemas.mockResolvedValue([]);
  });

  it("vizyondaki filmleri Vizyondaki Filmler rayında gösterir", async () => {
    movieService.getMovies.mockResolvedValue(MOVIES);

    renderHomePage();

    const rail = (
      await screen.findByRole("heading", { name: "Vizyondaki Filmler" })
    ).closest("section");

    // Rail'in başlığı yükleme durumunda da hemen render olur (statik prop);
    // film kartı ise `movies` sorgusu çözüldükten sonra gelir — bu yüzden
    // burada senkron getByText değil asenkron findByText kullanılmalı,
    // aksi halde test yükleme durumunu (StatusPanel) yakalayıp başarısız
    // olabilir (Task 6'nın implementer'ının bulduğu aynı sınıf hata).
    expect(
      await within(rail).findByText("Neon Yağmuru")
    ).toBeInTheDocument();
  });

  it("film yoksa Vizyondaki Filmler raylında boş durum mesajı gösterir", async () => {
    movieService.getMovies.mockResolvedValue([]);

    renderHomePage();

    expect(
      await screen.findByText("Şu anda vizyonda film bulunmuyor.")
    ).toBeInTheDocument();
  });

  it("bir rail kartına tıklanınca film detayına gider", async () => {
    movieService.getMovies.mockResolvedValue(MOVIES);

    renderHomePage();

    // Brief'teki orijinal test buradaki `screen.findByText("Neon Yağmuru")`yu
    // sayfa genelinde arıyordu; ancak QuickTicketStrip'in "Film" <select>'i
    // de aynı ada sahip bir <option> render ediyor, bu yüzden sorgu iki
    // eşleşme buluyor ve "Found multiple elements" ile başarısız oluyordu
    // (bir yarış durumu değil, gerçek bir sorgu belirsizliği hatası).
    // Fix: yukarıdaki testteki gibi sorguyu rail bölümüyle sınırlıyoruz.
    const rail = (
      await screen.findByRole("heading", { name: "Vizyondaki Filmler" })
    ).closest("section");

    fireEvent.click(await within(rail).findByText("Neon Yağmuru"));

    expect(
      await screen.findByText("Film detay sayfası")
    ).toBeInTheDocument();
  });
});

describe("HomePage — Sana Yakın Sinemalar ve Nasıl Çalışır", () => {
  const originalGeolocation = navigator.geolocation;

  beforeEach(() => {
    vi.clearAllMocks();
    movieService.getMovies.mockResolvedValue(MOVIES);
    cityResource.list.mockResolvedValue(CITIES);
    cinemaService.getCinemas.mockResolvedValue([
      {
        id: 1,
        name: "CineSeat Kadıköy",
        city: "İstanbul",
        lat: 40.9819,
        lng: 29.0233,
      },
    ]);
  });

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
    });
  });

  it("konum izni yoksa Tüm sinemaları gör çağrısı gösterir", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });

    renderHomePage();

    expect(
      await screen.findByText(
        "Size en yakın sinemaları göstermek için konum izni gerekiyor."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Tüm sinemaları gör" })
    ).toHaveAttribute("href", "/cinemas");
  });

  it("konum izni verilince en yakın sinemaları listeler", async () => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success) => {
          success({ coords: { latitude: 40.9819, longitude: 29.0233 } });
        },
      },
      configurable: true,
    });

    renderHomePage();

    expect(
      await screen.findByText("CineSeat Kadıköy")
    ).toBeInTheDocument();
  });

  it("Nasıl Çalışır bölümünün üç adımını gösterir", async () => {
    renderHomePage();

    expect(
      await screen.findByRole("heading", { name: "Nasıl Çalışır?" })
    ).toBeInTheDocument();
    expect(screen.getByText("Filmini seç")).toBeInTheDocument();
    expect(screen.getByText("Koltuğunu seç")).toBeInTheDocument();
    expect(screen.getByText("Biletin hazır")).toBeInTheDocument();
  });
});
