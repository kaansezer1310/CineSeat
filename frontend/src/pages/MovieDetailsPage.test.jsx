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
import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import CartProvider from "../context/CartProvider.jsx";
import AuthProvider from "../context/AuthProvider.jsx";
import movieService from "../services/movieService.js";
import sessionService from "../services/sessionService.js";
import commentService from "../services/commentService.js";
import MovieDetailsPage from "./MovieDetailsPage.jsx";

vi.mock("../hooks/useWatchlist.js", () => ({
  default: () => ({
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
      getMovieById: vi.fn(),
    },
  };
});

vi.mock("../services/sessionService.js", () => ({
  default: {
    getSessionsByMovieId: vi.fn(),
  },
}));

vi.mock("../services/commentService.js", () => ({
  default: {
    getCommentsByMovieId: vi.fn(),
    addComment: vi.fn(),
    deleteComment: vi.fn(),
    MAX_LENGTH: 1000,
  },
}));

function renderMovieDetailsPage(movieId = 1) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/movies/${movieId}`]}>
        <CartProvider>
          <AuthProvider>
            <Routes>
              <Route
                path="/movies/:movieId"
                element={<MovieDetailsPage />}
              />
            </Routes>
          </AuthProvider>
        </CartProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function loginAsMember() {
  const user = {
    id: 4,
    name: "Berke",
    email: "berke@cineseat.com",
    role: "member",
  };

  sessionStorage.setItem("cineseat_user", JSON.stringify(user));

  return user;
}

const movieWithTrailer = {
  id: 1,
  title: "Neon Yağmuru",
  genre: "Cyberpunk Dram",
  duration: 134,
  ageRating: "16+",
  releaseYear: 2026,
  releaseDate: "2026-07-13",
  description: "Açıklama.",
  fragmanYoutubeId: "dQw4w9WgXcQ",
};

const movieWithoutTrailer = {
  ...movieWithTrailer,
  fragmanYoutubeId: null,
};

describe("MovieDetailsPage — Fragman modalı (1.3.8)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionService.getSessionsByMovieId.mockResolvedValue([]);
  });

  it("fragmanYoutubeId yoksa 'Fragman İzle' butonu pasiftir", async () => {
    movieService.getMovieById.mockResolvedValue(
      movieWithoutTrailer
    );

    renderMovieDetailsPage();

    const trailerButton = await screen.findByRole("button", {
      name: "▶ Fragman İzle",
    });

    expect(trailerButton).toBeDisabled();
  });

  it("fragmanYoutubeId varsa butona tıklayınca modal + doğru YouTube iframe açılır", async () => {
    movieService.getMovieById.mockResolvedValue(
      movieWithTrailer
    );

    renderMovieDetailsPage();

    const trailerButton = await screen.findByRole("button", {
      name: "▶ Fragman İzle",
    });

    expect(trailerButton).not.toBeDisabled();

    fireEvent.click(trailerButton);

    const dialog = await screen.findByRole("dialog");
    const iframe = dialog.querySelector("iframe");

    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );

    expect(
      screen.getByText(
        "Fragman açılmıyorsa YouTube'da izle →"
      )
    ).toBeInTheDocument();
  });

  it("kapatma butonuna tıklayınca modal kapanır", async () => {
    movieService.getMovieById.mockResolvedValue(
      movieWithTrailer
    );

    renderMovieDetailsPage();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "▶ Fragman İzle",
      })
    );

    await screen.findByRole("dialog");

    fireEvent.click(
      screen.getByRole("button", { name: "Fragmanı kapat" })
    );

    expect(
      screen.queryByRole("dialog")
    ).not.toBeInTheDocument();
  });

  it("Escape tuşuna basınca modal kapanır", async () => {
    movieService.getMovieById.mockResolvedValue(
      movieWithTrailer
    );

    renderMovieDetailsPage();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "▶ Fragman İzle",
      })
    );

    await screen.findByRole("dialog");

    fireEvent.keyDown(document, { key: "Escape" });

    expect(
      screen.queryByRole("dialog")
    ).not.toBeInTheDocument();
  });
});

// T10: puan ve yorum tek kayıt. Yıldız artık yorum formunun içinde ve
// puan zorunlu, metin isteğe bağlı. Ayrı `ratingService` kaldırıldı.
describe("MovieDetailsPage — Değerlendirmeler (T10)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    sessionService.getSessionsByMovieId.mockResolvedValue([]);
    movieService.getMovieById.mockResolvedValue(movieWithTrailer);
    commentService.getCommentsByMovieId.mockResolvedValue([]);
    commentService.addComment.mockResolvedValue(42);
  });

  it("ziyaretçiye form yerine giriş uyarısı gösterilir", async () => {
    renderMovieDetailsPage();

    await screen.findByRole("heading", { name: "Neon Yağmuru" });

    expect(
      await screen.findByText(
        "Puan vermek ve yorum yapmak için giriş yapın."
      )
    ).toBeInTheDocument();
  });

  it("yıldız seçilmeden gönder butonu etkin değildir", async () => {
    loginAsMember();

    renderMovieDetailsPage();

    await screen.findByRole("heading", { name: "Neon Yağmuru" });

    expect(
      await screen.findByRole("button", { name: "Gönder" })
    ).toBeDisabled();
    expect(
      screen.getByText("Göndermek için önce bir yıldız seç.")
    ).toBeInTheDocument();
  });

  it("yalnızca yıldız seçilerek, metin yazmadan gönderilebilir", async () => {
    loginAsMember();

    renderMovieDetailsPage();

    await screen.findByRole("heading", { name: "Neon Yağmuru" });

    fireEvent.click(
      await screen.findByRole("button", { name: "4 yıldız ver" })
    );

    const submit = screen.getByRole("button", { name: "Gönder" });
    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    await waitFor(() => {
      expect(commentService.addComment).toHaveBeenCalledWith(1, {
        rating: 4,
        content: "",
      });
    });
  });

  it("yıldız ve metin birlikte gönderilir", async () => {
    loginAsMember();

    renderMovieDetailsPage();

    await screen.findByRole("heading", { name: "Neon Yağmuru" });

    fireEvent.click(
      await screen.findByRole("button", { name: "5 yıldız ver" })
    );

    fireEvent.change(screen.getByLabelText(/Yorumun/), {
      target: { value: "Görsel efektler harikaydı." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Gönder" }));

    await waitFor(() => {
      expect(commentService.addComment).toHaveBeenCalledWith(1, {
        rating: 5,
        content: "Görsel efektler harikaydı.",
      });
    });
  });

  it("metinsiz bir değerlendirmede listede açıklama gösterir", async () => {
    commentService.getCommentsByMovieId.mockResolvedValue([
      {
        id: 9,
        movieId: 1,
        userId: 2,
        userName: "kaan",
        rating: 3,
        text: "",
        isEdited: false,
        createdAt: "2026-08-01T10:00:00+03:00",
      },
    ]);

    renderMovieDetailsPage();

    expect(
      await screen.findByText(
        "Yorum yazılmamış, yalnızca puan verilmiş."
      )
    ).toBeInTheDocument();
  });

  it("başkasının yorumunda silme butonu göstermez", async () => {
    loginAsMember();
    commentService.getCommentsByMovieId.mockResolvedValue([
      {
        id: 9,
        movieId: 1,
        userId: 999,
        userName: "baskasi",
        rating: 3,
        text: "Fena değildi.",
        isEdited: false,
        createdAt: "2026-08-01T10:00:00+03:00",
      },
    ]);

    renderMovieDetailsPage();

    await screen.findByText("Fena değildi.");

    expect(
      screen.queryByRole("button", { name: "Sil" })
    ).not.toBeInTheDocument();
  });

  it("kendi yorumunda silme butonu gösterir", async () => {
    const user = loginAsMember();
    commentService.getCommentsByMovieId.mockResolvedValue([
      {
        id: 9,
        movieId: 1,
        userId: user.id,
        userName: user.name,
        rating: 3,
        text: "Kendi yorumum.",
        isEdited: false,
        createdAt: "2026-08-01T10:00:00+03:00",
      },
    ]);

    renderMovieDetailsPage();

    await screen.findByText("Kendi yorumum.");

    expect(
      screen.getByRole("button", { name: "Sil" })
    ).toBeInTheDocument();
  });
});
