# Faz 3b — MovieDetailsPage Yeniden Tasarımı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `MovieDetailsPage`'i spec §8'in istediği şekle taşımak: posterin bulanıklaştırılmış kopyası zemin (backdrop), meta bilgiler hap biçimli chip'ler, tek akış yerine sekmeli yapı (Seanslar / Hakkında / Yorumlar), Seanslar sekmesinde tarihe göre yapışkan seans seçici.

**Architecture:** Bu, "Faz 3a"nın (Stepper + BookingPage) ardından gelen ikinci dilim — Faz 3'ün spec'te bahsedilen ikinci "bespoke" (özel tasarım gerektiren) sayfası. İki görev: (1) `SessionList`'e tarihe göre gruplama mantığı eklemek — bugün seanslar tarihe bakılmaksızın tek bir ızgarada gösteriliyor; bu bileşen yalnızca `MovieDetailsPage` tarafından tüketiliyor, başka hiçbir sayfa kullanmıyor, dolayısıyla izole ve düşük riskli. (2) `MovieDetailsPage.jsx`'i backdrop + chip + sekme yapısına kavuşturmak — bu, sayfanın "tek akış" yapısını (poster+bilgi → fragman → seanslar → yorumlar, hepsi her zaman görünür) sekmeli bir yapıya (Seanslar/Hakkında/Yorumlar, birer birer görünür) dönüştürüyor; bu yüzden mevcut 11 testten 7'si (Değerlendirmeler grubu) artık önce "Yorumlar" sekmesine tıklamayı gerektiriyor — bu görev hem JSX'i hem bu 7 testi birlikte günceller (aksi halde branch geçici olarak kırmızı kalırdı).

**Tech Stack:** React 19, Vite, düz CSS (Faz 0'da kurulan token katmanı), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-27-frontend-ui-revizyonu-design.md` (§8 "MovieDetailsPage": yatay backdrop olmadığı için posterin bulanıklaştırılmış kopyası zemin, poster üstte net duruyor; meta chip'ler; sekmeler (Seanslar / Hakkında / Yorumlar); tarihe göre yapışkan seans seçici)

## Global Constraints

- `CommentForm`/`CommentList`/`TrailerModal`/`MoviePoster` bileşenlerinin İÇİ değişmiyor — yalnızca `MovieDetailsPage.jsx`'in bunları nerede/ne zaman render ettiği değişiyor (artık "Yorumlar" sekmesi aktifken).
- `.movie-tab-list`/`.movie-tab-button`/`.movie-tab-button-active` class'ları `MoviesPage.jsx` (Faz 2'de taşınan eski film listesi) ile **paylaşılıyor** — bu görevde CSS'i değiştirilmiyor, yalnızca `MovieDetailsPage.jsx`'in yeni sekme JSX'inde AYNEN tekrar kullanılıyor.
- `.watchlist-heart-button*` class'ları `MovieCard.jsx` ile paylaşılıyor — dokunulmuyor.
- `.trailer-*`/`.rating-*`/`.comment-*` class'ları yalnızca bu sayfaya özel, App.css'te olduğu gibi kalıyor (bu görev onları taşımıyor/tokenlamıyor — kapsam yalnızca backdrop/meta/layout/sekme çerçevesi).
- Yeni class isimleri `tokens.css`/`primitives.css`'teki mevcut token'ları kullanır (ham renk/px değeri yazılmaz).
- Her görev sonunda `npm run lint`, `npm run test:run` yeşil olmalı.

---

### Task 1: SessionList — tarihe göre yapışkan seans seçici

**Files:**
- Modify: `frontend/src/components/sessions/SessionList.jsx`
- Modify: `frontend/src/App.css:490-571` (`.session-section` → `.session-price`, medya sorgusu HARİÇ — bkz. aşağıdaki not)
- Test: `frontend/src/components/sessions/SessionList.test.jsx` (yeni — bugün bu bileşenin hiç testi yok)

**Interfaces:**
- Produces: `SessionList` bileşeninin dış arayüzü (`{ sessions, onSessionSelect }` props) **değişmiyor** — `MovieDetailsPage.jsx` bu bileşeni hiç değiştirmeden aynı şekilde çağırmaya devam edecek (Task 2'de).
- `session.date` alanı zaten `sessionService.js`'den Türkçe formatlanmış bir string olarak geliyor (örn. "13 Temmuz") — yeni bir alan/servis değişikliği gerekmiyor.

**Not (medya sorgusu neden bu görevin kapsamı dışında):** `App.css`'te bugün `.session-grid`'in mobil override'ı (`grid-template-columns: 1fr`), `.movie-details-layout`'un mobil override'ıyla AYNI `@media (max-width: 850px) { ... }` bloğunun içinde. `.movie-details-layout` Task 2'nin kapsamında olduğu için bu paylaşılan medya sorgusuna bu görevde DOKUNMA — App.css'te `.session-price { ... }` kuralının kapanışından hemen sonra gelen `@media (max-width: 850px) { ... }` bloğunu olduğu gibi bırak. Task 2 bu bloğu (hem layout hem session-grid parçasıyla birlikte) güncelleyecek.

- [ ] **Step 1: SessionList.jsx'i tarihe göre gruplama ile yeniden yaz**

```jsx
import { useState } from "react";

import SessionButton from "./SessionButton.jsx";

function getUniqueDates(sessions) {
  const seen = new Set();
  const dates = [];

  sessions.forEach((session) => {
    if (!seen.has(session.date)) {
      seen.add(session.date);
      dates.push(session.date);
    }
  });

  return dates;
}

function SessionList({ sessions, onSessionSelect }) {
  const uniqueDates = getUniqueDates(sessions);
  const [selectedDate, setSelectedDate] = useState(
    uniqueDates[0] ?? null
  );

  if (sessions.length === 0) {
    return (
      <div className="temporary-panel">
        Bu filme ait aktif seans bulunmuyor.
      </div>
    );
  }

  // `selectedDate` yalnızca ilk render'da uniqueDates[0]'a eşitleniyor;
  // veri değişip o tarih artık listede yoksa (ör. seanslar yenilendi) ilk
  // geçerli tarihe geri düşülür — ayrı bir useEffect gerekmez.
  const activeDate = uniqueDates.includes(selectedDate)
    ? selectedDate
    : uniqueDates[0];

  const sessionsForActiveDate = sessions.filter(
    (session) => session.date === activeDate
  );

  return (
    <div className="session-section">
      <div className="session-section-heading">
        <h2>Seans Seç</h2>

        <p>
          Önce bir tarih, ardından koltuk planını görmek için bir saat seç.
        </p>
      </div>

      <div
        className="session-date-picker"
        role="tablist"
        aria-label="Seans tarihi"
      >
        {uniqueDates.map((date) => {
          const isActive = date === activeDate;

          return (
            <button
              key={date}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={isActive ? "chip chip--active" : "chip"}
              onClick={() => setSelectedDate(date)}
            >
              {date}
            </button>
          );
        })}
      </div>

      <div className="session-grid">
        {sessionsForActiveDate.map((session) => {
          return (
            <SessionButton
              key={session.id}
              session={session}
              onSelect={onSessionSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

export default SessionList;
```

- [ ] **Step 2: App.css'te session bölümünü güncelle**

`frontend/src/App.css` içinde `.session-section {` ile başlayıp `.session-price { ... }` kuralının kapanışına kadarki bölümün TAMAMINI (yani hemen ardından gelen `@media (max-width: 850px) { ... }` bloğu HARİÇ) şununla değiştir:

```css
.session-section {
  margin-top: var(--space-12);
  padding-top: var(--space-6);

  border-top: 1px solid var(--color-border);
}

.session-section-heading {
  margin-bottom: var(--space-4);
}

.session-section-heading h2 {
  margin: 0;

  font-size: var(--text-2xl);
  font-weight: var(--weight-black);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.session-section-heading > p {
  margin: var(--space-1) 0 0;

  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.session-date-picker {
  position: sticky;
  top: var(--space-16);
  z-index: 1;

  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);

  margin-bottom: var(--space-5);
  padding-block: var(--space-2);

  background: var(--color-background);
}

.session-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
}

.session-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);

  width: 100%;
  min-height: 56px;
  padding: var(--space-3) var(--space-4);

  border-radius: var(--radius-md);

  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);

  cursor: pointer;

  transition:
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.session-button:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.session-time {
  color: var(--color-text);

  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}

.session-information {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.session-price {
  color: var(--color-purple);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}
```

Bu bloktan hemen sonra gelen `@media (max-width: 850px) { .movie-details-layout {...} .movie-details-poster-wrapper {...} .session-grid {...} }` bloğuna **dokunma** — Task 2 güncelleyecek.

- [ ] **Step 3: SessionList.test.jsx'i yaz**

```jsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SessionList from "./SessionList.jsx";

const SESSIONS = [
  { id: 1, date: "13 Temmuz", time: "14:00", hallName: "Salon 1", price: 120 },
  { id: 2, date: "13 Temmuz", time: "18:00", hallName: "Salon 2", price: 140 },
  { id: 3, date: "14 Temmuz", time: "20:00", hallName: "Salon 1", price: 120 },
];

describe("SessionList", () => {
  it("seans yoksa boş durum mesajı gösterir", () => {
    render(<SessionList sessions={[]} onSessionSelect={vi.fn()} />);

    expect(
      screen.getByText("Bu filme ait aktif seans bulunmuyor.")
    ).toBeInTheDocument();
  });

  it("varsayılan olarak ilk tarihi seçili gösterir ve o tarihin seanslarını listeler", () => {
    render(<SessionList sessions={SESSIONS} onSessionSelect={vi.fn()} />);

    expect(
      screen.getByRole("tab", { name: "13 Temmuz" })
    ).toHaveAttribute("aria-selected", "true");

    expect(screen.getByText("14:00")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.queryByText("20:00")).not.toBeInTheDocument();
  });

  it("başka bir tarihe tıklanınca o tarihin seansları gösterilir", () => {
    render(<SessionList sessions={SESSIONS} onSessionSelect={vi.fn()} />);

    fireEvent.click(screen.getByRole("tab", { name: "14 Temmuz" }));

    expect(
      screen.getByRole("tab", { name: "14 Temmuz" })
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("tab", { name: "13 Temmuz" })
    ).toHaveAttribute("aria-selected", "false");

    expect(screen.getByText("20:00")).toBeInTheDocument();
    expect(screen.queryByText("14:00")).not.toBeInTheDocument();
  });

  it("tekrarlanan tarihleri yalnızca bir kez tarih sekmesi olarak gösterir", () => {
    render(<SessionList sessions={SESSIONS} onSessionSelect={vi.fn()} />);

    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("bir seansa tıklanınca onSessionSelect id ile çağrılır", () => {
    const handleSelect = vi.fn();
    render(
      <SessionList sessions={SESSIONS} onSessionSelect={handleSelect} />
    );

    fireEvent.click(screen.getByText("14:00").closest("button"));

    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- SessionList.test.jsx`
Expected: 5/5 PASS

- [ ] **Step 5: Lint ve commit**

```bash
npm run lint
git add frontend/src/components/sessions/SessionList.jsx frontend/src/components/sessions/SessionList.test.jsx frontend/src/App.css
git commit -m "feat(frontend): SessionList'e tarihe göre yapışkan seans seçici ekle"
```

---

### Task 2: MovieDetailsPage — backdrop + meta chip'ler + sekmeler (Seanslar/Hakkında/Yorumlar)

**Files:**
- Modify: `frontend/src/pages/MovieDetailsPage.jsx` (tamamı)
- Modify: `frontend/src/App.css:391-482` (`.movie-details-layout` → `.movie-details-note p`) + `@media (max-width: 850px) { ... }` bloğu (Task 1'in bıraktığı, şimdi bu görevde tam haliyle güncelleniyor)
- Modify: `frontend/src/pages/MovieDetailsPage.test.jsx` ("Değerlendirmeler (T10)" describe bloğunun 7 testi + yeni bir sekme describe bloğu)

**Interfaces:**
- Consumes: `SessionList` (Task 1'in çıktısı, API değişmedi), `.movie-tab-list`/`.movie-tab-button`/`.movie-tab-button-active` (App.css'te zaten var, `MoviesPage.jsx` ile paylaşılıyor — bu görevde CSS'i değişmiyor, yalnızca JSX'te aynen kullanılıyor), `.chip` (primitives.css, değişmiyor).

**Karar (sekme içeriği dağılımı):** Spec "Seanslar / Hakkında / Yorumlar" istiyor. Bugünkü sayfanın içeriği şöyle dağıtılıyor: **Seanslar** → `SessionList` (aynen). **Hakkında** → film açıklaması (`movie.description`) + mevcut "Film hakkında" not kutusu (ikisi de bugün zaten vardı, sadece artık her zaman görünür değil, bu sekmenin altında). **Yorumlar** → mevcut `CommentForm`/`CommentList` bloğu (aynen, sadece artık koşullu render). Fragman butonu ve film başlığı/poster/meta bilgiler sekmelerin ÜSTÜNDE, her zaman görünür kalıyor (sekme değişse de kaybolmuyor).

- [ ] **Step 1: MovieDetailsPage.jsx'i yeniden yaz**

```jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MoviePoster from "../components/movies/MoviePoster.jsx";
import TrailerModal from "../components/movies/TrailerModal.jsx";
import CommentForm from "../components/movies/CommentForm.jsx";
import CommentList from "../components/movies/CommentList.jsx";
import SessionList from "../components/sessions/SessionList.jsx";
import movieService from "../services/movieService.js";
import sessionService from "../services/sessionService.js";
import useWatchlist from "../hooks/useWatchlist.js";

const DETAIL_TABS = [
  { id: "sessions", label: "Seanslar" },
  { id: "about", label: "Hakkında" },
  { id: "comments", label: "Yorumlar" },
];

function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useWatchlist();

  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("sessions");

  const numericMovieId = Number(movieId);

  const {
    data: movie,
    isLoading: isMovieLoading,
    error: movieError,
  } = useQuery({
    queryKey: ["movie", numericMovieId],
    queryFn: () => {
      return movieService.getMovieById(numericMovieId);
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: sessions = [],
    isLoading: areSessionsLoading,
    error: sessionsError,
  } = useQuery({
    queryKey: ["sessions", numericMovieId],
    queryFn: () => {
      return sessionService.getSessionsByMovieId(
        numericMovieId
      );
    },
    staleTime: 60 * 1000,
  });

  function handleSessionSelect(sessionId) {
    navigate(`/booking/${sessionId}`);
  }

  if (isMovieLoading || areSessionsLoading) {
    return (
      <div className="temporary-panel">
        Film ve seans bilgileri yükleniyor.
      </div>
    );
  }

  if (movieError || sessionsError) {
    const errorMessage =
      movieError?.message ||
      sessionsError?.message ||
      "Bilgiler alınamadı.";

    return (
      <section>
        <div className="page-heading">
          <h1>Film bilgileri alınamadı</h1>
          <p>{errorMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="movie-details-page">
      {movie.poster && (
        <div
          className="movie-details-backdrop"
          style={{ backgroundImage: `url(${movie.poster})` }}
          aria-hidden="true"
        />
      )}

      <div className="movie-details-layout">
        <div className="movie-details-poster-wrapper">
          <MoviePoster
            key={movie.poster}
            movie={movie}
            className="movie-details-poster"
          />
        </div>

        <div className="movie-details-content">
          <p className="page-label">{movie.genre}</p>

          <div className="movie-details-title-row">
            <h1>{movie.title}</h1>
            <button
              type="button"
              className={`watchlist-heart-button watchlist-heart-button--large ${isFavorite(movie.id) ? 'watchlist-heart-button--active' : 'watchlist-heart-button--inactive'}`}
              onClick={() => toggleFavorite(movie.id)}
              title={isFavorite(movie.id) ? "İzleme listesinden çıkar" : "İzleme listesine ekle"}
              aria-label="Favori Ekle/Çıkar"
            >
              {isFavorite(movie.id) ? "♥" : "♡"}
            </button>
          </div>

          <div className="movie-details-meta">
            <span className="chip">{movie.releaseYear}</span>
            <span className="chip">{movie.duration} dakika</span>
            <span className="chip">{movie.ageRating}</span>
          </div>

          <button
            className="secondary-button trailer-open-button"
            type="button"
            onClick={() => setIsTrailerOpen(true)}
            disabled={!movie.fragmanYoutubeId}
            title={
              movie.fragmanYoutubeId
                ? undefined
                : "Bu film için henüz fragman eklenmedi."
            }
          >
            ▶ Fragman İzle
          </button>
        </div>
      </div>

      {isTrailerOpen && movie.fragmanYoutubeId && (
        <TrailerModal
          youtubeId={movie.fragmanYoutubeId}
          movieTitle={movie.title}
          onClose={() => setIsTrailerOpen(false)}
        />
      )}

      <div className="movie-tab-list" role="tablist">
        {DETAIL_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                isActive
                  ? "movie-tab-button movie-tab-button-active"
                  : "movie-tab-button"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "sessions" && (
        <SessionList
          sessions={sessions}
          onSessionSelect={handleSessionSelect}
        />
      )}

      {activeTab === "about" && (
        <div className="movie-details-about">
          <p className="movie-details-description">
            {movie.description}
          </p>

          <div className="movie-details-note">
            <strong>Film hakkında</strong>

            <p>
              Seans seçiminin ardından salonun koltuk
              planına yönlendirileceksin.
            </p>
          </div>
        </div>
      )}

      {activeTab === "comments" && (
        <section className="movie-details-social">
          <h2>Değerlendirmeler</h2>

          {movieService.isMovieReleased(movie) ? (
            <CommentForm movieId={movie.id} />
          ) : (
            <p className="comment-guest-hint">
              Film vizyona girdiğinde puan verebilir ve yorum yazabilirsin.
            </p>
          )}

          <CommentList movieId={movie.id} />
        </section>
      )}
    </section>
  );
}

export default MovieDetailsPage;
```

- [ ] **Step 2: App.css'te movie-details bölümünü güncelle**

`frontend/src/App.css` içinde `.movie-details-layout {` ile başlayıp `.movie-details-note p { ... }` kuralının kapanışına kadarki bölümün TAMAMINI şununla değiştir:

```css
.movie-details-page {
  position: relative;
  z-index: 0;
}

.movie-details-backdrop {
  position: absolute;
  top: calc(-1 * var(--space-8));
  left: 0;
  right: 0;
  z-index: -1;

  height: 380px;
  border-radius: var(--radius-xl);

  background-size: cover;
  background-position: center 25%;
  filter: blur(40px) saturate(1.1);
  opacity: 0.4;

  mask-image: linear-gradient(180deg, black 0%, transparent 90%);
  -webkit-mask-image: linear-gradient(180deg, black 0%, transparent 90%);
}

.movie-details-layout {
  display: grid;
  grid-template-columns: minmax(250px, 340px) 1fr;
  gap: clamp(var(--space-8), 6vw, var(--space-16));
  align-items: center;
}

.movie-details-poster-wrapper {
  overflow: hidden;

  border-radius: var(--radius-lg);

  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.movie-details-poster {
  display: block;

  width: 100%;
  aspect-ratio: 2 / 3;

  object-fit: cover;
}

.movie-details-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.movie-details-content h1 {
  margin: 0;

  color: var(--color-text);

  font-size: var(--text-5xl);
  font-weight: var(--weight-black);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.movie-details-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);

  margin: var(--space-5) 0;
}

.movie-details-meta .chip {
  cursor: default;
}

.movie-details-description {
  max-width: 700px;
  margin: 0 0 var(--space-5);

  color: var(--color-text-muted);

  font-size: var(--text-md);
  font-weight: var(--weight-regular);
  line-height: 1.55;
}

.movie-details-note {
  max-width: 620px;

  padding: var(--space-4) var(--space-5);

  border-left: 2px solid var(--color-border-strong);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;

  background: var(--color-background-soft);
}

.movie-details-note strong {
  color: var(--color-text);
  font-weight: var(--weight-semibold);
}

.movie-details-note p {
  margin: var(--space-2) 0 0;
}
```

Hemen ardından gelen `@media (max-width: 850px) { ... }` bloğunun TAMAMINI (Task 1'in dokunmadan bıraktığı blok) şununla değiştir:

```css
@media (max-width: 850px) {
  .movie-details-layout {
    grid-template-columns: 1fr;
  }

  .movie-details-poster-wrapper {
    width: min(100%, 330px);
  }

  .session-grid {
    grid-template-columns: 1fr;
  }
}
```

(İçerik aslında Task 1 öncesiyle aynı — yalnızca bu görev tarafından yeniden teyit ediliyor, çünkü iki farklı görev arasında paylaşılan tek medya sorgusuydu.)

- [ ] **Step 3: MovieDetailsPage.test.jsx'i güncelle**

Dosyanın `describe("MovieDetailsPage — Değerlendirmeler (T10)", ...)` bloğunun TAMAMINI (satır ~221'den dosya sonuna kadar) şununla değiştir:

```jsx
// T10: puan ve yorum tek kayıt. Yıldız artık yorum formunun içinde ve
// puan zorunlu, metin isteğe bağlı. Ayrı `ratingService` kaldırıldı.
// Faz 3b: yorum formu/listesi artık "Yorumlar" sekmesinin altında —
// varsayılan sekme "Seanslar" olduğu için her testte önce sekmeye
// tıklanması gerekiyor.
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
    fireEvent.click(screen.getByRole("tab", { name: "Yorumlar" }));

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
    fireEvent.click(screen.getByRole("tab", { name: "Yorumlar" }));

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
    fireEvent.click(screen.getByRole("tab", { name: "Yorumlar" }));

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
    fireEvent.click(screen.getByRole("tab", { name: "Yorumlar" }));

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

    await screen.findByRole("heading", { name: "Neon Yağmuru" });
    fireEvent.click(screen.getByRole("tab", { name: "Yorumlar" }));

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

    await screen.findByRole("heading", { name: "Neon Yağmuru" });
    fireEvent.click(screen.getByRole("tab", { name: "Yorumlar" }));

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

    await screen.findByRole("heading", { name: "Neon Yağmuru" });
    fireEvent.click(screen.getByRole("tab", { name: "Yorumlar" }));

    await screen.findByText("Kendi yorumum.");

    expect(
      screen.getByRole("button", { name: "Sil" })
    ).toBeInTheDocument();
  });
});

describe("MovieDetailsPage — Sekmeler (Seanslar/Hakkında/Yorumlar)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    movieService.getMovieById.mockResolvedValue(movieWithTrailer);
    sessionService.getSessionsByMovieId.mockResolvedValue([]);
    commentService.getCommentsByMovieId.mockResolvedValue([]);
  });

  it("varsayılan olarak Seanslar sekmesi aktiftir", async () => {
    renderMovieDetailsPage();

    const sessionsTab = await screen.findByRole("tab", {
      name: "Seanslar",
    });

    expect(sessionsTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByText("Bu filme ait aktif seans bulunmuyor.")
    ).toBeInTheDocument();
  });

  it("Hakkında sekmesine geçince film açıklamasını gösterir", async () => {
    renderMovieDetailsPage();

    await screen.findByRole("tab", { name: "Seanslar" });

    fireEvent.click(screen.getByRole("tab", { name: "Hakkında" }));

    expect(screen.getByText("Açıklama.")).toBeInTheDocument();
    expect(
      screen.queryByText("Bu filme ait aktif seans bulunmuyor.")
    ).not.toBeInTheDocument();
  });

  it("sekme değişse de üstteki film başlığı ve fragman butonu kaybolmaz", async () => {
    renderMovieDetailsPage();

    await screen.findByRole("tab", { name: "Seanslar" });
    fireEvent.click(screen.getByRole("tab", { name: "Hakkında" }));

    expect(
      screen.getByRole("heading", { name: "Neon Yağmuru" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "▶ Fragman İzle" })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- MovieDetailsPage.test.jsx SessionList.test.jsx`
Expected: MovieDetailsPage 14/14 (4 fragman + 7 değerlendirme + 3 yeni sekme), SessionList 5/5 — hepsi PASS

- [ ] **Step 5: Lint ve build kontrolü**

```bash
npm run lint
npm run build
```

Expected: ikisi de hatasız.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/MovieDetailsPage.jsx frontend/src/pages/MovieDetailsPage.test.jsx frontend/src/App.css
git commit -m "feat(frontend): MovieDetailsPage'e backdrop, meta chip'ler ve sekmeler ekle"
```
