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
import MovieDetailsPage from "./MovieDetailsPage.jsx";

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
      getMovieById: vi.fn(),
    },
  };
});

vi.mock("../services/sessionService.js", () => ({
  default: {
    getSessionsByMovieId: vi.fn(),
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
  sessionStorage.setItem(
    "cineseat_user",
    JSON.stringify({
      id: 4,
      name: "Berke",
      email: "berke@cineseat.com",
      role: "member",
    })
  );
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

// id: 5 gerçek movies.js'te rating {average: 0, count: 0} ile tohumlanmış —
// bu testler gerçek seed puanıyla karışmadan, sıfırdan puanlama davranışını
// doğrulayabilsin diye kasıtlı seçildi (ratingService, movie.id üzerinden
// gerçek data/movies.js'e bakıyor, test mock'una değil).
const movieForRatingTests = {
  ...movieWithTrailer,
  id: 5,
};

describe("MovieDetailsPage — Puanlama (1.3.9)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    sessionService.getSessionsByMovieId.mockResolvedValue([]);
    movieService.getMovieById.mockResolvedValue(
      movieForRatingTests
    );
  });

  it("ziyaretçi için yıldızlar pasiftir, giriş uyarısı gösterilir", async () => {
    renderMovieDetailsPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    expect(
      screen.getByText("Puan vermek için giriş yapmalısın.")
    ).toBeInTheDocument();

    const firstStar = screen.getByRole("button", {
      name: "1 yıldız ver",
    });

    expect(firstStar).toBeDisabled();
  });

  it("üye bir yıldıza tıklayınca puanı gönderir ve özet güncellenir", async () => {
    loginAsMember();

    renderMovieDetailsPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    expect(
      screen.queryByText("Puan vermek için giriş yapmalısın.")
    ).not.toBeInTheDocument();

    const fifthStar = screen.getByRole("button", {
      name: "5 yıldız ver",
    });

    expect(fifthStar).not.toBeDisabled();

    fireEvent.click(fifthStar);

    expect(
      await screen.findByText("5.0 / 5 (1 oy)")
    ).toBeInTheDocument();
  });
});

describe("MovieDetailsPage — Yorumlar (1.3.10 / 1.3.11)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    sessionService.getSessionsByMovieId.mockResolvedValue([]);
  });

  it("ziyaretçiye yorum formu yerine giriş uyarısı gösterilir", async () => {
    movieService.getMovieById.mockResolvedValue({
      ...movieWithTrailer,
      id: 3,
    });

    renderMovieDetailsPage();

    await screen.findByRole("heading", {
      name: "Neon Yağmuru",
    });

    expect(
      screen.getByText("Yorum yapmak için giriş yapın.")
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Yorumun")
    ).not.toBeInTheDocument();
  });

  it("hiç yorumu olmayan bir filmde boş durum mesajı gösterir", async () => {
    movieService.getMovieById.mockResolvedValue({
      ...movieWithTrailer,
      id: 3,
    });

    renderMovieDetailsPage();

    expect(
      await screen.findByText(
        "Henüz yorum yapılmamış. İlk yorumu sen yaz!"
      )
    ).toBeInTheDocument();
  });

  it("id 1 filminde tohum (mock) yorumlar listelenir", async () => {
    movieService.getMovieById.mockResolvedValue({
      ...movieWithTrailer,
      id: 1,
    });

    renderMovieDetailsPage();

    expect(
      await screen.findByText(
        /Görsel efektler harikaydı/
      )
    ).toBeInTheDocument();
  });

  it("üye, kısa bir yorumla gönder butonunu etkinleştiremez", async () => {
    loginAsMember();
    movieService.getMovieById.mockResolvedValue({
      ...movieWithTrailer,
      id: 3,
    });

    renderMovieDetailsPage();

    const textarea = await screen.findByLabelText("Yorumun");

    fireEvent.change(textarea, { target: { value: "kısa" } });

    expect(
      screen.getByRole("button", { name: "Yorum Yap" })
    ).toBeDisabled();
  });

  it("üye geçerli bir yorum gönderince listede görünür", async () => {
    loginAsMember();
    movieService.getMovieById.mockResolvedValue({
      ...movieWithTrailer,
      id: 3,
    });

    renderMovieDetailsPage();

    const textarea = await screen.findByLabelText("Yorumun");

    fireEvent.change(textarea, {
      target: {
        value: "Bu film hakkında gerçekten olumlu düşünüyorum.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Yorum Yap" })
    );

    // Buton "Yorum Yap"a dönene kadar bekle — mutation tamamlanmadan
    // metni sadece textarea'nın kendi (React kontrollü) içeriğinde de
    // bulmak mümkün, bu yüzden gerçek listeye düşene kadar bekliyoruz.
    await screen.findByRole("button", { name: "Yorum Yap" });

    const list = await screen.findByRole("list");

    expect(
      await within(list).findByText(
        "Bu film hakkında gerçekten olumlu düşünüyorum."
      )
    ).toBeInTheDocument();
  });

  it("üye kendi yorumunu silebilir, başkasının yorumunda düzenle/sil butonu görmez", async () => {
    loginAsMember();
    movieService.getMovieById.mockResolvedValue({
      ...movieWithTrailer,
      id: 1,
    });

    renderMovieDetailsPage();

    // id 1'deki seed yorumlar başka kullanıcılara ait — düzenle/sil yok.
    await screen.findByText(/Görsel efektler harikaydı/);

    expect(
      screen.queryByRole("button", { name: "Sil" })
    ).not.toBeInTheDocument();

    const textarea = screen.getByLabelText("Yorumun");

    fireEvent.change(textarea, {
      target: { value: "Kendi eklediğim yeni yorum metni." },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Yorum Yap" })
    );

    await screen.findByRole("button", { name: "Yorum Yap" });

    const list = await screen.findByRole("list");

    await within(list).findByText(
      "Kendi eklediğim yeni yorum metni."
    );

    const deleteButtons = within(list).getAllByRole("button", {
      name: "Sil",
    });

    expect(deleteButtons).toHaveLength(1);

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(
        within(list).queryByText(
          "Kendi eklediğim yeni yorum metni."
        )
      ).not.toBeInTheDocument();
    });
  });
});
