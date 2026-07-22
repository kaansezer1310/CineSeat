import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import movieService from "../services/movieService.js";
import HomePage from "./HomePage.jsx";

vi.mock("../context/WatchlistContext.jsx", () => ({
  useWatchlist: () => ({
    watchlist: [],
    toggleFavorite: vi.fn(),
    isFavorite: vi.fn(() => false),
    getFavoriteMovieIds: vi.fn(() => []),
  }),
}));

vi.mock("../services/movieService.js", async () => {
  const actual = await vi.importActual(
    "../services/movieService.js"
  );

  return {
    default: {
      ...actual.default,
      getMovies: vi.fn(),
    },
  };
});

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function isoDateOffsetFromToday(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const COMING_SOON_DAYS_OFFSET = 29;

const nowShowingMovie = {
  id: 1,
  title: "Neon Yağmuru",
  genre: "Cyberpunk Dram",
  duration: 134,
  ageRating: "16+",
  releaseYear: 2026,
  releaseDate: isoDateOffsetFromToday(-3),
  description: "Vizyondaki film.",
  rating: { average: 3.5 },
};

const secondNowShowingMovie = {
  id: 8,
  title: "Yanlış Düğün",
  genre: "Komedi",
  duration: 101,
  ageRating: "7+",
  releaseYear: 2026,
  releaseDate: isoDateOffsetFromToday(-10),
  description: "İkinci vizyondaki film.",
  rating: { average: 4.8 },
};

const comingSoonMovie = {
  id: 5,
  title: "Kayıp Sinyal",
  genre: "Bilim Kurgu",
  duration: 121,
  ageRating: "13+",
  releaseYear: 2026,
  releaseDate: isoDateOffsetFromToday(
    COMING_SOON_DAYS_OFFSET
  ),
  description: "Yakında vizyonda.",
};

const archivedMovie = {
  id: 7,
  title: "Son Tren",
  genre: "Dram",
  duration: 112,
  ageRating: "13+",
  releaseYear: 2026,
  releaseDate: isoDateOffsetFromToday(-60),
  screeningEndDate: isoDateOffsetFromToday(-30),
  description: "Vizyon süresi dolmuş film.",
};

describe("HomePage - Vizyonda / Yakında sekmeleri", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("varsayılan olarak Vizyonda sekmesini gösterir", async () => {
    movieService.getMovies.mockResolvedValue([
      nowShowingMovie,
      comingSoonMovie,
    ]);

    renderHomePage();

    expect(
      await screen.findByRole("heading", {
        name: "Neon Yağmuru",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Kayıp Sinyal",
      })
    ).not.toBeInTheDocument();
  });

  it("Yakında sekmesine geçince sayfa yenilenmeden ilgili filmleri ve kalan gün sayısını gösterir", async () => {
    movieService.getMovies.mockResolvedValue([
      nowShowingMovie,
      comingSoonMovie,
    ]);

    renderHomePage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.click(
      screen.getByRole("tab", { name: "Yakında" })
    );

    expect(
      await screen.findByRole("heading", {
        name: "Kayıp Sinyal",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Neon Yağmuru",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        `Vizyona ${COMING_SOON_DAYS_OFFSET} gün kaldı`
      )
    ).toBeInTheDocument();

    expect(movieService.getMovies).toHaveBeenCalledTimes(1);
  });

  it("bir sekmede film yoksa boş durum mesajı gösterir", async () => {
    movieService.getMovies.mockResolvedValue([
      nowShowingMovie,
    ]);

    renderHomePage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.click(
      screen.getByRole("tab", { name: "Yakında" })
    );

    expect(
      await screen.findByText(
        "Yakında vizyona girecek film bulunmuyor."
      )
    ).toBeInTheDocument();
  });

  it("vizyon süresi dolan (arşivlenmiş) filmi hiçbir sekmede göstermez", async () => {
    movieService.getMovies.mockResolvedValue([
      nowShowingMovie,
      comingSoonMovie,
      archivedMovie,
    ]);

    renderHomePage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    expect(
      screen.queryByRole("heading", { name: "Son Tren" })
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("tab", { name: "Yakında" })
    );

    await screen.findByRole("heading", {
      name: "Kayıp Sinyal",
    });

    expect(
      screen.queryByRole("heading", { name: "Son Tren" })
    ).not.toBeInTheDocument();
  });
});

describe("HomePage — Sıralama ve filtreleme (1.3.3 / 1.3.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("varsayılan sıralama vizyon tarihine göre yeniden eskiyedir", async () => {
    movieService.getMovies.mockResolvedValue([
      nowShowingMovie,
      secondNowShowingMovie,
    ]);

    renderHomePage();

    const headings = await screen.findAllByRole("heading", {
      level: 2,
    });

    expect(headings.map((h) => h.textContent)).toEqual([
      "Neon Yağmuru",
      "Yanlış Düğün",
    ]);
  });

  it("puana göre sıralama seçilince sırayı değiştirir", async () => {
    movieService.getMovies.mockResolvedValue([
      nowShowingMovie,
      secondNowShowingMovie,
    ]);

    renderHomePage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.change(screen.getByLabelText("Sırala"), {
      target: { value: "rating-desc" },
    });

    const headings = await screen.findAllByRole("heading", {
      level: 2,
    });

    expect(headings.map((h) => h.textContent)).toEqual([
      "Yanlış Düğün",
      "Neon Yağmuru",
    ]);
  });

  it("türe göre filtreleyince eşleşmeyen filmi gizler", async () => {
    movieService.getMovies.mockResolvedValue([
      nowShowingMovie,
      secondNowShowingMovie,
    ]);

    renderHomePage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.change(screen.getByLabelText("Tür"), {
      target: { value: "Komedi" },
    });

    expect(
      await screen.findByRole("heading", {
        name: "Yanlış Düğün",
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Neon Yağmuru" })
    ).not.toBeInTheDocument();
  });

  it("filtre sonucu boşsa 'eşleşen film yok' mesajı gösterir", async () => {
    movieService.getMovies.mockResolvedValue([
      nowShowingMovie,
      secondNowShowingMovie,
    ]);

    renderHomePage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    fireEvent.change(screen.getByLabelText("Yaş Sınırı"), {
      target: { value: "18+" },
    });

    expect(
      await screen.findByText(
        "Seçtiğin filtrelere uyan film bulunamadı."
      )
    ).toBeInTheDocument();
  });
});
