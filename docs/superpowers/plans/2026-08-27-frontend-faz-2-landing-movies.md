# Faz 2 — Landing Yeniden Yazımı + /movies Ayrımı + Rail Bileşeni — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/` rotasını gerçek bir vitrine (hero + hızlı bilet şeridi + 5 içerik bölümü) dönüştürmek; bugünkü `HomePage.jsx`'in sekme/filtre/sıralama/grid mantığını yeni `/movies` rotasına taşımak; landing'in film şeritleri için yeniden kullanılabilir bir `Rail` primitifi kurmak.

**Architecture:** Mevcut servis katmanı (`movieService`, `campaignService`, `cinemaService`, `locationService`) hiç değişmeden tüketilir — bu faz yalnızca sunum katmanını değiştirir, backend/servis sözleşmesine dokunmaz (spec §11). `HomePage.jsx` bugünkü içeriğiyle birebir `MoviesPage.jsx`'e taşınır (Görev 5), ardından `HomePage.jsx` sıfırdan landing olarak yeniden yazılır (Görev 6-8, aynı dosya üç görev boyunca büyür — her görev dosyanın TAM halini verir, diff değil). İki yeni paylaşılan parça çıkarılır: `Rail` (genel amaçlı yatay kaydırma primitifi, `components/ui/`) ve `useNearestCinemas` (CinemasPage'deki Haversine+konum mantığının hem CinemasPage hem landing tarafından kullanılabilmesi için hook'a çıkarılmış hali).

**Tech Stack:** React 19, React Router 7, TanStack Query 5, düz CSS (token katmanı — Faz 0/1'de kuruldu), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-27-frontend-ui-revizyonu-design.md` (§3.3 hero kararı, §5 Rail primitifi, §7.1 landing bölüm sırası, §10 Faz 2 tanımı, §11 kapsam dışı)

## Global Constraints

- Bu faz **hiçbir backend/servis değişikliği içermez** (spec §11) — `movieService`, `campaignService`, `cinemaService`, `locationService` API'leri aynen kullanılır, genişletilmez.
- Erişilebilir isimler ve roller sabit kalır; yalnızca yeni landing içeriği için yeni testler yazılır (spec §9).
- Landing tüm bölümleri `Layout.jsx`'in `<main className="container">` sarmalayıcısı içinde kalır — full-bleed (viewport'a taşan) tasarım YOK. Hero, `.container` genişliğinde (max 1200px) büyük yuvarlak köşeli bir "kart" olarak tasarlanır (100vw taşma tekniği CSS'te yatay scrollbar riski taşıdığı için bilinçli olarak kullanılmıyor).
- Yeni class isimleri `tokens.css`/`primitives.css`/`utilities.css`'teki mevcut token'ları kullanır (ham renk/px değeri yazılmaz).
- Her görev sonunda `npm run lint`, `npm run test:run` yeşil olmalı. Görev 8 (son görev) ayrıca `npm run build`'i de çalıştırır (spec §9: "Her faz sonunda ... yeşil olmadan bir sonraki faza geçilmez").
- `frontend/src/App.css`'e **yeni class eklenmez, taşınmaz** — bu faz App.css'e dokunmaz. Yeni her şey ya bileşenle birlikte gelen kendi `.css` dosyasında (`Rail.css`, `RailMovieCard.css`) ya da sayfaya özel `pages/home.css`'te yaşar (CinemasPage'in kendi `cinemas.css`'i ile aynı desen).
- `/movies` rotasının içeriği (mevcut sekme/filtre/sıralama/grid) bu fazda **değiştirilmiyor** — birebir taşınıyor. Görsel revizyonu ayrı, gelecekteki bir işin kapsamı.

---

### Task 1: Rail primitifi

**Files:**
- Create: `frontend/src/components/ui/Rail.jsx`
- Create: `frontend/src/components/ui/Rail.css`
- Test: `frontend/src/components/ui/Rail.test.jsx`

**Interfaces:**
- Produces: `Rail` bileşeni, default export. Props: `{ title?: string, viewAllHref?: string, viewAllLabel?: string, ariaLabel?: string, children: ReactNode }`. `title` verilmezse başlık satırı hiç render edilmez; `viewAllHref` verilmezse "Tümünü gör" linki render edilmez. `children` `.rail` (mevcut `utilities.css`'teki yatay kaydırma class'ı) içine aynen basılır.
- Consumes: `utilities.css`'teki mevcut `.rail` class'ı (proje kökünde zaten tanımlı, değiştirilmiyor).

- [ ] **Step 1: Rail.jsx'i yaz**

```jsx
import { Link } from "react-router-dom";

import "./Rail.css";

function Rail({
  title,
  viewAllHref,
  viewAllLabel = "Tümünü gör →",
  ariaLabel,
  children,
}) {
  return (
    <section className="rail-section" aria-label={ariaLabel ?? title}>
      {(title || viewAllHref) && (
        <div className="rail-section-heading">
          {title && <h2 className="rail-section-title">{title}</h2>}

          {viewAllHref && (
            <Link to={viewAllHref} className="rail-section-link">
              {viewAllLabel}
            </Link>
          )}
        </div>
      )}

      <div className="rail" role="list">
        {children}
      </div>
    </section>
  );
}

export default Rail;
```

- [ ] **Step 2: Rail.css'i yaz**

```css
.rail-section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);

  margin-bottom: var(--space-4);
}

.rail-section-title {
  margin: 0;

  color: var(--color-text);
  font-size: var(--text-2xl);
  font-weight: var(--weight-black);
  letter-spacing: -0.02em;
}

.rail-section-link {
  flex-shrink: 0;

  color: var(--color-purple);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}

.rail-section-link:hover {
  color: var(--color-purple-dark);
}
```

- [ ] **Step 3: Rail.test.jsx'i yaz**

```jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Rail from "./Rail.jsx";

function renderRail(props) {
  render(
    <MemoryRouter>
      <Rail {...props}>
        <div>Öğe 1</div>
        <div>Öğe 2</div>
      </Rail>
    </MemoryRouter>
  );
}

describe("Rail", () => {
  it("başlığı ve çocukları render eder", () => {
    renderRail({ title: "Vizyondaki Filmler" });

    expect(
      screen.getByRole("heading", { level: 2, name: "Vizyondaki Filmler" })
    ).toBeInTheDocument();
    expect(screen.getByText("Öğe 1")).toBeInTheDocument();
    expect(screen.getByText("Öğe 2")).toBeInTheDocument();
  });

  it("viewAllHref verilince Tümünü gör linkini doğru adrese bağlar", () => {
    renderRail({ title: "Yakında", viewAllHref: "/movies" });

    expect(
      screen.getByRole("link", { name: "Tümünü gör →" })
    ).toHaveAttribute("href", "/movies");
  });

  it("viewAllHref verilmeyince link render edilmez", () => {
    renderRail({ title: "Yakında" });

    expect(
      screen.queryByRole("link", { name: "Tümünü gör →" })
    ).not.toBeInTheDocument();
  });

  it("title ve viewAllHref yoksa başlık satırını hiç render etmez", () => {
    const { container } = render(
      <MemoryRouter>
        <Rail>
          <div>Öğe 1</div>
        </Rail>
      </MemoryRouter>
    );

    expect(
      container.querySelector(".rail-section-heading")
    ).not.toBeInTheDocument();
  });

  it("çocukları role=list konteynerinde render eder", () => {
    renderRail({ title: "Test" });

    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- Rail.test.jsx` (frontend/ dizininde)
Expected: 5/5 PASS

- [ ] **Step 5: Lint ve commit**

```bash
npm run lint
git add frontend/src/components/ui/Rail.jsx frontend/src/components/ui/Rail.css frontend/src/components/ui/Rail.test.jsx
git commit -m "feat(frontend): Rail primitifini ekle"
```

---

### Task 2: useNearestCinemas hook'u + CinemasPage refactor

**Files:**
- Create: `frontend/src/hooks/useNearestCinemas.js`
- Create: `frontend/src/hooks/useNearestCinemas.test.jsx`
- Modify: `frontend/src/pages/CinemasPage.jsx` (tamamı)
- Modify: `frontend/src/pages/CinemasPage.test.jsx:47` (tek route değişikliği)

**Interfaces:**
- Produces: `useNearestCinemas()` hook, default export, dönen şekil: `{ cinemas: Cinema[], isLoading: boolean, error: Error|null, locationStatus: string, hasLocation: boolean }`. `cinemas`, konum varsa mesafeye göre artan sıralı (`distance` alanı eklenmiş), yoksa `cinemaService.getCinemas()`'ın ham sırası.
- Consumes: `cinemaService.getCinemas()` (mevcut, değişmiyor — dönen her `Cinema` objesinde `lat`/`lng` alanları var, bkz. `services/cinemaService.js`).

**Bağlam:** `CinemasPage.jsx`'te bugün modül içi tanımlı olan Haversine mesafe hesabı + `navigator.geolocation` izin isteme mantığı, landing'in "Sana Yakın Sinemalar" bölümünde de (Görev 8) aynen gerekiyor. Aynı mantığı iki yerde tekrar yazmak yerine buraya çıkarılıyor; `CinemasPage.jsx` de bu hook'u tüketecek şekilde küçültülüyor. `navigator.geolocation` jsdom'da tanımlı değildir — mevcut testler zaten hep "konum yok" dalını dolaylı olarak kapsıyordu, bu görev bunu hook seviyesinde açıkça test ediyor.

**Ayrıca düzeltilen bir hata:** `CinemasPage.jsx`'teki `handleViewSessions`, "Seansları Gör" butonuna tıklanınca bugün `navigate("/")`'e gidiyor — çünkü bugün `/` film listesiydi. Bu fazda `/` landing'e dönüştüğü ve film listesi `/movies`'e taşındığı için (Görev 5) bu çağrı `navigate("/movies")` olarak düzeltilmeli, yoksa buton kullanıcıyı film seçemeyeceği landing'e götürür.

- [ ] **Step 1: useNearestCinemas.js'i yaz**

```js
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import cinemaService from "../services/cinemaService.js";

// Haversine Formülü (İki koordinat arası mesafe hesaplar - km cinsinden)
// CinemasPage.jsx'ten değişmeden taşındı.
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function useNearestCinemas() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(() =>
    "geolocation" in navigator
      ? "Konum aranıyor..."
      : "Tarayıcınız konum özelliğini desteklemiyor. Şehir seçerek sinemaları görebilirsiniz."
  );

  const {
    data: cinemas = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cinemas"],
    queryFn: cinemaService.getCinemas,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus(
          "Konumunuz bulundu. Size en yakın sinemalar hesaplandı."
        );
      },
      (error) => {
        console.error("Konum bilgisi alınamadı:", error);
        setLocationStatus(
          "Konum izni verilmedi. Tüm sinemalar listeleniyor, dilerseniz şehir seçerek daraltabilirsiniz."
        );
      }
    );
  }, []);

  const cinemasWithDistance = userLocation
    ? cinemas
        .map((cinema) => ({
          ...cinema,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            cinema.lat,
            cinema.lng
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
    : cinemas;

  return {
    cinemas: cinemasWithDistance,
    isLoading,
    error,
    locationStatus,
    hasLocation: Boolean(userLocation),
  };
}

export default useNearestCinemas;
```

- [ ] **Step 2: useNearestCinemas.test.jsx'i yaz**

```jsx
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
```

- [ ] **Step 3: CinemasPage.jsx'i hook'u kullanacak şekilde yeniden yaz**

Dosyanın TAM yeni hali (eskisinin yerine geçer):

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../components/ui/PageHeader.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import StatusPanel from '../components/ui/StatusPanel.jsx';
import useNearestCinemas from '../hooks/useNearestCinemas.js';
import './cinemas.css';

const ALL_CITIES = "Tümü";

export default function CinemasPage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);

  const { cinemas, isLoading, error, locationStatus } = useNearestCinemas();

  const cities = [
    ALL_CITIES,
    ...new Set(cinemas.map((cinema) => cinema.city).filter(Boolean)),
  ];

  // sessions.js'deki seans kayıtları herhangi bir cinemaId/hallName eşlemesi
  // içermediği için (bkz. src/data/sessions.js), belirli bir şubeye özel
  // seans listesine yönlendirme şu an veri modelinde mümkün değil. Bu yüzden
  // kullanıcıyı film seçimine başladığı genel akışa (/movies) götürür.
  // Gerçek "bu şubenin seansları" filtrelemesi için sessions.js'e bir
  // cinemaId alanı eklenmesi gerekir.
  function handleViewSessions() {
    navigate("/movies");
  }

  const filteredCinemas =
    selectedCity === ALL_CITIES
      ? cinemas
      : cinemas.filter((cinema) => cinema.city === selectedCity);

  return (
    <div className="cinemas-page">
      {/* T9: sekme değil kendi rotası olduğu için başlık artık burada. */}
      <PageHeader
        title="Sinemalarımız"
        description="Size en yakın sinemaları keşfedin ve detayları görün."
      />

      <p className="cinemas-location-status">{locationStatus}</p>

      {error && (
        <StatusPanel
          variant="error"
          title="Sinemalar alınamadı"
          description={error.message}
        />
      )}

      <div className="cinemas-filter">
        <label htmlFor="cinemas-city-select">Şehir Seçin: </label>
        <select
          id="cinemas-city-select"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="city-select"
        >
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="cinemas-grid">
        {isLoading && (
          <StatusPanel variant="loading" title="Sinemalar yükleniyor…" />
        )}

        {filteredCinemas.map(cinema => (
          <div key={cinema.id} className="cinema-card">
            <h3>{cinema.name}</h3>
            <p className="cinema-city">{cinema.city}</p>
            {cinema.distance !== undefined && (
              <p className="cinema-distance">
                Size uzaklığı: <strong>{cinema.distance.toFixed(1)} km</strong>
              </p>
            )}
            <button
              className="secondary-button cinema-card-action"
              type="button"
              onClick={handleViewSessions}
            >
              Seansları Gör
            </button>
          </div>
        ))}
        {!isLoading && !error && filteredCinemas.length === 0 && (
          <EmptyState
            icon="🎦"
            title="Bu şehirde henüz sinemamız bulunmuyor."
            description="Başka bir şehir seçerek yakınınızdaki salonlara bakabilirsiniz."
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: CinemasPage.test.jsx'te tek route'u güncelle**

`frontend/src/pages/CinemasPage.test.jsx` dosyasında `renderCinemasPage` fonksiyonu içindeki (satır ~40):

```jsx
            <Route path="/" element={<div>Ana sayfa</div>} />
```

satırını şuna değiştir:

```jsx
            <Route path="/movies" element={<div>Ana sayfa</div>} />
```

Dosyanın geri kalanı (son test dahil, `"'Seansları Gör' kullanıcıyı ana sayfaya yönlendirir"`) değişmeden kalır — test zaten `screen.findByText("Ana sayfa")` arıyor, hangi path'e bağlı olduğu önemli değil.

- [ ] **Step 5: Testleri çalıştır**

Run: `npm run test:run -- useNearestCinemas CinemasPage`
Expected: hepsi PASS (useNearestCinemas: 3/3, CinemasPage: 7/7)

- [ ] **Step 6: Lint ve commit**

```bash
npm run lint
git add frontend/src/hooks/useNearestCinemas.js frontend/src/hooks/useNearestCinemas.test.jsx frontend/src/pages/CinemasPage.jsx frontend/src/pages/CinemasPage.test.jsx
git commit -m "refactor(frontend): Haversine/konum mantığını useNearestCinemas hook'una çıkar"
```

---

### Task 3: RailMovieCard bileşeni

**Files:**
- Create: `frontend/src/components/movies/RailMovieCard.jsx`
- Create: `frontend/src/components/movies/RailMovieCard.css`
- Test: `frontend/src/components/movies/RailMovieCard.test.jsx`

**Interfaces:**
- Produces: `RailMovieCard` bileşeni, default export. Props: `{ movie: Movie, onSelect: (movieId: number) => void }`. Kök eleman `<article role="listitem">` — `Rail`'in `role="list"` konteyneri içinde doğru ARIA çifti oluşturması için.
- Consumes: `MoviePoster` (`components/movies/MoviePoster.jsx`, değişmiyor), `movieService.isMovieReleased`/`getDaysUntilRelease` (değişmiyor).

**Bağlam:** Mevcut `MovieCard.jsx` (grid görünümü için) açıklama paragrafı + favori kalp butonu taşıyan ağır bir kart; yatay kaydırmalı bir rayda (Netflix tarzı poster şeridi) bu kadar içerik göze batar. Bu yüzden landing rayları için ayrı, kompakt bir kart: sadece poster + başlık + tek satır meta bilgi. Favori ekleme burada yok (o affordance zaten `/movies` grid'inde ve film detayında var — burada tekrarı YAGNI).

- [ ] **Step 1: RailMovieCard.jsx'i yaz**

```jsx
import MoviePoster from "./MoviePoster.jsx";
import movieService from "../../services/movieService.js";

import "./RailMovieCard.css";

function formatMeta(movie) {
  if (!movieService.isMovieReleased(movie)) {
    const daysRemaining = movieService.getDaysUntilRelease(movie);

    if (daysRemaining <= 0) {
      return "Bugün vizyonda";
    }

    if (daysRemaining === 1) {
      return "Yarın vizyonda";
    }

    return `${daysRemaining} gün sonra`;
  }

  return movie.genre;
}

function RailMovieCard({ movie, onSelect }) {
  return (
    <article className="rail-movie-card" role="listitem">
      <button
        type="button"
        className="rail-movie-card-button"
        onClick={() => onSelect(movie.id)}
      >
        <MoviePoster
          key={movie.poster}
          movie={movie}
          className="rail-movie-card-poster"
        />

        <span className="rail-movie-card-title">{movie.title}</span>
        <span className="rail-movie-card-meta">{formatMeta(movie)}</span>
      </button>
    </article>
  );
}

export default RailMovieCard;
```

- [ ] **Step 2: RailMovieCard.css'i yaz**

```css
.rail-movie-card {
  width: 180px;
}

.rail-movie-card-button {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  width: 100%;
  padding: 0;

  background: none;
  text-align: left;
  cursor: pointer;
}

.rail-movie-card-poster {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition:
    box-shadow var(--duration-base) var(--ease-out),
    transform var(--duration-base) var(--ease-out);
}

.rail-movie-card-button:hover .rail-movie-card-poster {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.rail-movie-card-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;

  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}

.rail-movie-card-meta {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}
```

- [ ] **Step 3: RailMovieCard.test.jsx'i yaz**

```jsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RailMovieCard from "./RailMovieCard.jsx";

function isoDateOffsetFromToday(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const RELEASED_MOVIE = {
  id: 1,
  title: "Neon Yağmuru",
  genre: "Cyberpunk Dram",
  poster: "/posters/neon-yagmuru.png",
  releaseDate: isoDateOffsetFromToday(-3),
};

const UPCOMING_MOVIE = {
  id: 2,
  title: "Gelecek Filmi",
  genre: "Bilim Kurgu",
  poster: "/posters/gelecek.png",
  releaseDate: isoDateOffsetFromToday(3),
};

describe("RailMovieCard", () => {
  it("vizyondaki film için tür bilgisini gösterir", () => {
    render(<RailMovieCard movie={RELEASED_MOVIE} onSelect={vi.fn()} />);

    expect(screen.getByText("Neon Yağmuru")).toBeInTheDocument();
    expect(screen.getByText("Cyberpunk Dram")).toBeInTheDocument();
  });

  it("yakında vizyona girecek film için kalan gün sayısını gösterir", () => {
    render(<RailMovieCard movie={UPCOMING_MOVIE} onSelect={vi.fn()} />);

    expect(screen.getByText("3 gün sonra")).toBeInTheDocument();
  });

  it("tıklanınca onSelect'i film id'siyle çağırır", () => {
    const handleSelect = vi.fn();
    render(
      <RailMovieCard movie={RELEASED_MOVIE} onSelect={handleSelect} />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it("listitem rolüyle render edilir (Rail'in role=list konteynerine uyum için)", () => {
    render(<RailMovieCard movie={RELEASED_MOVIE} onSelect={vi.fn()} />);

    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- RailMovieCard.test.jsx`
Expected: 4/4 PASS

- [ ] **Step 5: Lint ve commit**

```bash
npm run lint
git add frontend/src/components/movies/RailMovieCard.jsx frontend/src/components/movies/RailMovieCard.css frontend/src/components/movies/RailMovieCard.test.jsx
git commit -m "feat(frontend): landing rayları için RailMovieCard bileşenini ekle"
```

---

### Task 4: Header/MobileMenu/Footer navigasyonunu /movies'e güncelle

**Files:**
- Modify: `frontend/src/components/layout/Header.jsx:27-30`
- Modify: `frontend/src/components/layout/Header.test.jsx`
- Modify: `frontend/src/components/layout/MobileMenu.jsx:93-95`
- Modify: `frontend/src/components/layout/MobileMenu.test.jsx`
- Modify: `frontend/src/components/layout/Footer.jsx:24-26`
- Modify: `frontend/src/components/layout/Footer.test.jsx`

**Bağlam:** Bugün `/` film listesi olduğu için "Filmler" nav linki `to="/"` idi. Bu fazda `/` landing'e dönüşüyor ve film listesi `/movies`'e taşınıyor (Görev 5) — bu yüzden "Filmler" tüm nav yerlerinde `/movies`'e işaret etmeli, yoksa kullanıcı "Filmler"e tıklayınca landing'e geri döner (kırık gezinme). `end` prop'u da kaldırılıyor: `NavLink to="/movies"` (end olmadan) `/movies/42` gibi alt rotalarda da aktif görünsün diye — kullanıcı bir filmin detayındayken "Filmler" sekmesinin vurgulu kalması doğru davranış.

- [ ] **Step 1: Header.jsx'te nav linkini güncelle**

`frontend/src/components/layout/Header.jsx` içinde:

```jsx
          <NavLink to="/" end className={navLinkClass}>
            Filmler
          </NavLink>
```

bloğunu şuna değiştir:

```jsx
          <NavLink to="/movies" className={navLinkClass}>
            Filmler
          </NavLink>
```

- [ ] **Step 2: Header.test.jsx'i güncelle**

"üç ana nav öğesini gösterir" testinde:

```jsx
    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("href", "/");
```

satırını şuna değiştir:

```jsx
    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("href", "/movies");
```

Ayrıca `describe("Header", ...)` bloğunun sonuna, `end` prop'unun kaldırılmasıyla değişen davranışı (alt rotada da aktif kalması) doğrulayan yeni bir test ekle:

```jsx
  it("bir film detay sayfasındayken Filmler bağlantısını aktif işaretler", () => {
    renderHeader("/movies/42");

    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("aria-current", "page");
  });
```

- [ ] **Step 3: MobileMenu.jsx'te nav linkini güncelle**

`frontend/src/components/layout/MobileMenu.jsx` içinde:

```jsx
            <NavLink to="/" end className={mobileNavLinkClass} onClick={close}>
              Filmler
            </NavLink>
```

bloğunu şuna değiştir:

```jsx
            <NavLink to="/movies" className={mobileNavLinkClass} onClick={close}>
              Filmler
            </NavLink>
```

- [ ] **Step 4: MobileMenu.test.jsx'i güncelle**

"tetikleyiciye tıklayınca nav linklerini gösterir" testinde:

```jsx
    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("href", "/");
```

satırını şuna değiştir:

```jsx
    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("href", "/movies");
```

- [ ] **Step 5: Footer.jsx'te linki güncelle**

`frontend/src/components/layout/Footer.jsx` içinde:

```jsx
              <li>
                <Link to="/">Vizyondaki Filmler</Link>
              </li>
```

bloğunu şuna değiştir:

```jsx
              <li>
                <Link to="/movies">Vizyondaki Filmler</Link>
              </li>
```

- [ ] **Step 6: Footer.test.jsx'e assertion ekle**

"Keşfet sütununda mevcut rotalara bağlantı verir" testinin içine, mevcut `Sinemalar` assertion'ından hemen sonra ekle:

```jsx
    expect(
      screen.getByRole("link", { name: "Vizyondaki Filmler" })
    ).toHaveAttribute("href", "/movies");
```

- [ ] **Step 7: Testleri çalıştır**

Run: `npm run test:run -- Header.test.jsx MobileMenu.test.jsx Footer.test.jsx`
Expected: Header 11/11 (10 mevcut + 1 yeni), MobileMenu 7/7, Footer 4/4 — hepsi PASS

- [ ] **Step 8: Lint ve commit**

```bash
npm run lint
git add frontend/src/components/layout/Header.jsx frontend/src/components/layout/Header.test.jsx frontend/src/components/layout/MobileMenu.jsx frontend/src/components/layout/MobileMenu.test.jsx frontend/src/components/layout/Footer.jsx frontend/src/components/layout/Footer.test.jsx
git commit -m "fix(frontend): Filmler nav bağlantılarını /movies'e güncelle"
```

---

### Task 5: /movies rotası — MoviesPage.jsx (HomePage'in taşınması)

**Files:**
- Create: `frontend/src/pages/MoviesPage.jsx`
- Create: `frontend/src/pages/MoviesPage.test.jsx`
- Modify: `frontend/src/App.jsx:5,70`

**Interfaces:**
- Produces: `/movies` rotası, `MoviesPage` bileşeni (bugünkü `HomePage.jsx`'in birebir aynısı, yalnızca isim değişti).
- Consumes: Hiçbir yeni bağımlılık yok — mevcut `MovieList`, `SortControl`, `FilterControl`, `movieService`, `useWatchlist` aynen kullanılıyor.

**Bağlam:** Bu görev **mekanik bir taşıma** — bugünkü `HomePage.jsx` ve `HomePage.test.jsx` içerik olarak hiç değişmeden yeni dosyalara kopyalanıyor, yalnızca fonksiyon/import adları `HomePage` → `MoviesPage` olarak değişiyor. Görsel/davranışsal hiçbir değişiklik yok. Bu adımdan sonra `/` hâlâ eski `HomePage.jsx` içeriğini gösterir (landing'e dönüşümü Görev 6-8'de) — yani `/` ve `/movies` bu görev sonunda aynı içeriği gösterir, bu geçici ve beklenen bir ara durumdur.

- [ ] **Step 1: MoviesPage.jsx'i oluştur**

`frontend/src/pages/HomePage.jsx`'in TAM içeriğini `frontend/src/pages/MoviesPage.jsx`'e kopyala, şu iki değişiklikle:
- `function HomePage() {` → `function MoviesPage() {`
- `export default HomePage;` → `export default MoviesPage;`

Dosyanın geri kalanı (importlar, `RECENTLY_RELEASED_WINDOW_DAYS`, `isRecentlyReleased`, `MOVIE_TABS`, tüm JSX) **birebir aynı** kalır.

- [ ] **Step 2: MoviesPage.test.jsx'i oluştur**

`frontend/src/pages/HomePage.test.jsx`'in TAM içeriğini `frontend/src/pages/MoviesPage.test.jsx`'e kopyala, şu değişikliklerle:
- `import HomePage from "./HomePage.jsx";` → `import MoviesPage from "./MoviesPage.jsx";`
- `renderHomePage()` fonksiyonu içindeki `<HomePage />` → `<MoviesPage />`
- Üç `describe(...)` başlığındaki `"HomePage..."` önekini `"MoviesPage..."` ile değiştir (örn. `describe("HomePage - Vizyonda / Yakında sekmeleri", ...)` → `describe("MoviesPage - Vizyonda / Yakında sekmeleri", ...)`). Test senaryolarının kendisi (it blokları) değişmez.

- [ ] **Step 3: App.jsx'e /movies rotasını ekle**

`frontend/src/App.jsx` satır 5'teki importun hemen altına yeni import ekle:

```jsx
import HomePage from "./pages/HomePage.jsx";
import MoviesPage from "./pages/MoviesPage.jsx";
```

Satır 70 civarındaki `<Route path="/" element={<HomePage />} />` satırının hemen altına yeni route ekle:

```jsx
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
```

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- MoviesPage.test.jsx`
Expected: 11/11 PASS (HomePage.test.jsx'teki mevcut test sayısıyla birebir aynı)

- [ ] **Step 5: Lint ve commit**

```bash
npm run lint
git add frontend/src/pages/MoviesPage.jsx frontend/src/pages/MoviesPage.test.jsx frontend/src/App.jsx
git commit -m "feat(frontend): film listesini /movies rotasına taşı"
```

---

### Task 6: Landing — Hero + hızlı bilet şeridi

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx` (tamamı, sıfırdan yeniden yazılıyor)
- Create: `frontend/src/pages/home.css`
- Modify: `frontend/src/pages/HomePage.test.jsx` (tamamı, sıfırdan yeniden yazılıyor)

**Interfaces:**
- Produces: `HomePage.jsx` artık landing'in ilk iki bölümünü (Hero, hızlı bilet şeridi) render eder. Görev 7 ve 8 aynı dosyaya bölüm ekleyecek — bu görev dosyanın iskeletini ve veri çekme kısmını kurar.
- Consumes: `movieService.getMovies`/`isMovieArchived`/`isMovieReleased`/`sortMovies` (değişmiyor), `cityResource.list()` (`services/locationService.js`, değişmiyor).

**Karar (hızlı bilet şeridi):** Spec §3.3 "Şehir / Film / Tarih seçici + CTA" istiyor, ama spec §11 bu revizyonun hiçbir backend değişikliği içermediğini söylüyor — backend'de şehir+film+tarih birleşik bir seans arama ucu yok. Bu yüzden üç alan da gerçek input olarak var ama yönlendirme mantığı şöyle: **Film seçiliyse** `/movies/:movieId`'e gider (orada o filmin gerçek seansları görünür); film seçili değilse ama **şehir seçiliyse** `/cinemas`'a o şehir önceden seçili olarak gider (CitySelector'daki ile aynı desen); ikisi de seçili değilse `/movies`'e gider. Tarih alanı şimdilik yalnızca bilgi amaçlı kalır (gelecekte gerçek bir seans-tarih sorgusu eklenirse bağlanacak alan).

- [ ] **Step 1: home.css'i oluştur**

```css
.landing {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);

  padding-bottom: var(--space-16);
}

/* Hero ------------------------------------------------------------- */

.hero {
  position: relative;
  overflow: hidden;

  border-radius: var(--radius-xl);
  background-color: var(--color-surface-light);
  background-size: cover;
  background-position: center;
  box-shadow: var(--shadow-lg);
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;

  background: linear-gradient(
    120deg,
    rgba(250, 248, 252, 0.96) 0%,
    rgba(250, 248, 252, 0.86) 55%,
    rgba(250, 248, 252, 0.65) 100%
  );
}

:root[data-theme="dark"] .hero::before {
  background: linear-gradient(
    120deg,
    rgba(12, 9, 18, 0.96) 0%,
    rgba(12, 9, 18, 0.86) 55%,
    rgba(12, 9, 18, 0.65) 100%
  );
}

.hero-inner {
  position: relative;
  z-index: 1;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 360px);
  align-items: center;
  gap: var(--space-8);

  padding: var(--space-12) var(--space-8);
}

.hero-eyebrow {
  display: inline-block;
  margin-bottom: var(--space-3);

  color: var(--color-purple);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.hero-title {
  margin: 0 0 var(--space-4);

  color: var(--color-text);
  font-size: var(--text-5xl);
  font-weight: var(--weight-black);
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.hero-description {
  max-width: 480px;
  margin: 0 0 var(--space-6);

  color: var(--color-text-muted);
  font-size: var(--text-md);
  line-height: 1.6;
}

.hero-actions {
  margin-bottom: var(--space-8);
}

.hero-stats {
  display: flex;
  gap: var(--space-8);
  margin: 0;
}

.hero-stat dt {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hero-stat dd {
  margin: var(--space-1) 0 0;

  color: var(--color-text);
  font-size: var(--text-xl);
  font-weight: var(--weight-black);
}

.hero-posters {
  position: relative;
  height: 320px;
}

.hero-poster {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 160px;
  height: 240px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.hero-poster-1 {
  z-index: 1;
  transform: translate(-85%, -55%) rotate(-8deg);
}

.hero-poster-2 {
  z-index: 2;
  transform: translate(-50%, -50%) rotate(0deg);
}

.hero-poster-3 {
  z-index: 1;
  transform: translate(-15%, -55%) rotate(8deg);
}

@media (max-width: 860px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }

  .hero-posters {
    height: 220px;
  }
}

/* Hızlı bilet şeridi ------------------------------------------------ */

.quick-ticket-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--space-4);

  margin-top: calc(-1 * var(--space-8));
  padding: var(--space-5);

  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.quick-ticket-field {
  display: flex;
  flex: 1 1 160px;
  flex-direction: column;
  gap: var(--space-1);

  color: var(--color-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}

.quick-ticket-submit {
  flex: 0 0 auto;
}

@media (max-width: 640px) {
  .quick-ticket-strip {
    margin-top: var(--space-4);
  }

  .quick-ticket-field {
    flex-basis: 100%;
  }
}
```

- [ ] **Step 2: HomePage.jsx'i yeniden yaz**

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import movieService from "../services/movieService.js";
import { cityResource } from "../services/locationService.js";
import heroPoster from "../assets/hero.png";

import "./home.css";

function QuickTicketStrip({ movies, cities, onSubmit }) {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ city: selectedCity, movieId: selectedMovieId });
  }

  return (
    <form className="quick-ticket-strip" onSubmit={handleSubmit}>
      <label className="quick-ticket-field">
        <span>Şehir</span>
        <select
          className="input"
          value={selectedCity}
          onChange={(event) => setSelectedCity(event.target.value)}
        >
          <option value="">Şehir seç</option>
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <label className="quick-ticket-field">
        <span>Film</span>
        <select
          className="input"
          value={selectedMovieId}
          onChange={(event) => setSelectedMovieId(event.target.value)}
        >
          <option value="">Film seç</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
      </label>

      <label className="quick-ticket-field">
        <span>Tarih</span>
        {/* Backend'de şehir+film+tarih birleşik seans sorgusu yok (spec
            §11 — bu revizyon hiçbir backend değişikliği içermiyor), bu
            yüzden tarih şimdilik yalnızca bilgi amaçlı; "Seansları Bul"
            yönlendirmesi film/şehir seçimine göre çalışır. */}
        <input
          className="input"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </label>

      <button
        type="submit"
        className="btn btn--primary btn--md quick-ticket-submit"
      >
        Seansları Bul
      </button>
    </form>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => cityResource.list(),
    staleTime: 30 * 60 * 1000,
  });

  const activeMovies = movies.filter(
    (movie) => !movieService.isMovieArchived(movie)
  );
  const nowShowingMovies = activeMovies.filter((movie) =>
    movieService.isMovieReleased(movie)
  );
  const heroPosters = movieService
    .sortMovies(nowShowingMovies, "rating-desc")
    .slice(0, 3);

  const averageRating =
    activeMovies.length > 0
      ? activeMovies.reduce(
          (sum, movie) => sum + (movie.rating?.average ?? 0),
          0
        ) / activeMovies.length
      : 0;

  function handleQuickTicketSubmit({ city, movieId }) {
    if (movieId) {
      navigate(`/movies/${movieId}`);
      return;
    }

    if (city) {
      navigate("/cinemas", { state: { city } });
      return;
    }

    navigate("/movies");
  }

  return (
    <div className="landing">
      <section
        className="hero"
        style={{ backgroundImage: `url(${heroPoster})` }}
      >
        <div className="hero-inner">
          <div className="hero-message">
            <span className="hero-eyebrow">CineSeat</span>

            <h1 className="hero-title">
              Bileti telefonundan al, koltuğunu önceden seç.
            </h1>

            <p className="hero-description">
              Türkiye&apos;nin dört bir yanındaki sinemalardan saniyeler
              içinde bilet al, sırada beklemeden salona gir.
            </p>

            <div className="hero-actions">
              <Link to="/movies" className="btn btn--primary btn--lg">
                Bilet Al
              </Link>
            </div>

            <dl className="hero-stats">
              <div className="hero-stat">
                <dt>Film</dt>
                <dd data-testid="hero-stat-movies">
                  {moviesLoading ? "—" : activeMovies.length}
                </dd>
              </div>

              <div className="hero-stat">
                <dt>Şehir</dt>
                <dd data-testid="hero-stat-cities">{cities.length}</dd>
              </div>

              <div className="hero-stat">
                <dt>Kullanıcı Puanı</dt>
                <dd data-testid="hero-stat-rating">
                  {averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="hero-posters" aria-hidden="true">
            {heroPosters.map((movie, index) => (
              <img
                key={movie.id}
                src={movie.poster}
                alt=""
                className={`hero-poster hero-poster-${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <QuickTicketStrip
        movies={nowShowingMovies}
        cities={cities}
        onSubmit={handleQuickTicketSubmit}
      />
    </div>
  );
}

export default HomePage;
```

- [ ] **Step 3: HomePage.test.jsx'i yeniden yaz**

```jsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    await waitFor(() =>
      expect(screen.getByTestId("hero-stat-movies")).toHaveTextContent("2")
    );
    expect(screen.getByTestId("hero-stat-cities")).toHaveTextContent("2");
  });

  it("vizyondaki en yüksek puanlı filmleri poster yelpazesinde gösterir", async () => {
    const { container } = renderHomePage();

    await waitFor(() =>
      expect(container.querySelectorAll(".hero-poster")).toHaveLength(2)
    );

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
```

**Not (Task 6'nın implementer'ı tarafından bulunan ve düzeltilen gerçek hatalar — plan metni bu düzeltmelerle güncellendi):** Yukarıdaki kod iki hatanın düzeltilmiş halini içeriyor: (1) `renderHomePage`'in `render(...)` çağrısının önünde `return` eksikti — `const { container } = renderHomePage()` kullanan test bu yüzden çökerdi; (2) `findByTestId`/`findByLabelText`/`getByText` gibi sorgular, veri yüklenmeden önce zaten DOM'da var olan (yükleme durumundaki) elemente hemen çözülüyordu, bu da `<select>`'te henüz var olmayan bir `<option>`'a `fireEvent.change` uygulanıp sessizce başarısız olmasına veya poster/istatistik testlerinin "—"/0 okuyup başarısız olmasına yol açıyordu. Task 7 ve Task 8'in test bölümlerinde de aynı hata sınıfına dikkat edin — veri yüklenmesine bağlı bir metne senkron `getByText`/`queryByText` yerine asenkron `findByText`/`waitFor` kullanın (Task 7'nin "vizyondaki filmleri Vizyondaki Filmler rayında gösterir" testinde bu zaten uygulandı).

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- HomePage.test.jsx`
Expected: 5/5 PASS

- [ ] **Step 5: Lint ve commit**

```bash
npm run lint
git add frontend/src/pages/HomePage.jsx frontend/src/pages/HomePage.test.jsx frontend/src/pages/home.css
git commit -m "feat(frontend): landing hero ve hızlı bilet şeridini kur"
```

---

### Task 7: Landing — Vizyondaki Filmler / Yakında rayları + Kampanyalar

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx` (tamamı — Task 6'nın üzerine büyür)
- Modify: `frontend/src/pages/home.css` (Task 6'nın sonuna ekleniyor)
- Modify: `frontend/src/pages/HomePage.test.jsx` (tamamı — Task 6'nın üzerine büyür)

**Interfaces:**
- Consumes: `Rail` (`components/ui/Rail.jsx`, Görev 1), `RailMovieCard` (`components/movies/RailMovieCard.jsx`, Görev 3), `StatusPanel`/`EmptyState` (`components/ui/`, değişmiyor), `campaignService.getActiveCampaigns` + `formatCampaignValue` (`services/campaignService.js`, değişmiyor).

**Karar (Kampanyalar kart tasarımı):** `campaignService`'in veri modelinde görsel/tarih alanı yok (bkz. keşif — yalnızca `name`/`type`/`value`/`minCartTotal`/`membersOnly`/`isActive`). Bu yüzden kart metin ağırlıklı: indirim rozeti + isim + koşul metni. Aktif kampanya yoksa bölüm hiç render edilmez (boş bir promosyon bölümü göstermek yerine sessizce gizlenir).

- [ ] **Step 1: home.css'e Kampanyalar stillerini ekle**

Dosyanın SONUNA ekle:

```css

/* Kampanyalar ve genel landing bölüm başlığı --------------------------- */

.landing-section {
  display: flex;
  flex-direction: column;
}

.campaign-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-5);
}

.campaign-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);

  padding: var(--space-6);

  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.campaign-card-title {
  margin: 0;

  color: var(--color-text);
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
}

.campaign-card-condition {
  margin: 0;

  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
```

- [ ] **Step 2: HomePage.jsx'i genişlet**

Dosyanın TAM yeni hali (Task 6'nın üzerine üç yeni bölüm ve ilgili veri/importlar eklendi):

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import movieService from "../services/movieService.js";
import campaignService, {
  formatCampaignValue,
} from "../services/campaignService.js";
import { cityResource } from "../services/locationService.js";
import Rail from "../components/ui/Rail.jsx";
import RailMovieCard from "../components/movies/RailMovieCard.jsx";
import StatusPanel from "../components/ui/StatusPanel.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import heroPoster from "../assets/hero.png";

import "./home.css";

function QuickTicketStrip({ movies, cities, onSubmit }) {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ city: selectedCity, movieId: selectedMovieId });
  }

  return (
    <form className="quick-ticket-strip" onSubmit={handleSubmit}>
      <label className="quick-ticket-field">
        <span>Şehir</span>
        <select
          className="input"
          value={selectedCity}
          onChange={(event) => setSelectedCity(event.target.value)}
        >
          <option value="">Şehir seç</option>
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <label className="quick-ticket-field">
        <span>Film</span>
        <select
          className="input"
          value={selectedMovieId}
          onChange={(event) => setSelectedMovieId(event.target.value)}
        >
          <option value="">Film seç</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
      </label>

      <label className="quick-ticket-field">
        <span>Tarih</span>
        {/* Backend'de şehir+film+tarih birleşik seans sorgusu yok (spec
            §11 — bu revizyon hiçbir backend değişikliği içermiyor), bu
            yüzden tarih şimdilik yalnızca bilgi amaçlı; "Seansları Bul"
            yönlendirmesi film/şehir seçimine göre çalışır. */}
        <input
          className="input"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </label>

      <button
        type="submit"
        className="btn btn--primary btn--md quick-ticket-submit"
      >
        Seansları Bul
      </button>
    </form>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => cityResource.list(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", "active"],
    queryFn: campaignService.getActiveCampaigns,
    staleTime: 5 * 60 * 1000,
  });

  const activeMovies = movies.filter(
    (movie) => !movieService.isMovieArchived(movie)
  );
  const nowShowingMovies = activeMovies.filter((movie) =>
    movieService.isMovieReleased(movie)
  );
  const comingSoonMovies = activeMovies.filter(
    (movie) =>
      !movieService.isMovieReleased(movie) &&
      movieService.isWithinComingSoonWindow(movie)
  );
  const heroPosters = movieService
    .sortMovies(nowShowingMovies, "rating-desc")
    .slice(0, 3);

  const averageRating =
    activeMovies.length > 0
      ? activeMovies.reduce(
          (sum, movie) => sum + (movie.rating?.average ?? 0),
          0
        ) / activeMovies.length
      : 0;

  function handleQuickTicketSubmit({ city, movieId }) {
    if (movieId) {
      navigate(`/movies/${movieId}`);
      return;
    }

    if (city) {
      navigate("/cinemas", { state: { city } });
      return;
    }

    navigate("/movies");
  }

  function handleMovieSelect(movieId) {
    navigate(`/movies/${movieId}`);
  }

  return (
    <div className="landing">
      <section
        className="hero"
        style={{ backgroundImage: `url(${heroPoster})` }}
      >
        <div className="hero-inner">
          <div className="hero-message">
            <span className="hero-eyebrow">CineSeat</span>

            <h1 className="hero-title">
              Bileti telefonundan al, koltuğunu önceden seç.
            </h1>

            <p className="hero-description">
              Türkiye&apos;nin dört bir yanındaki sinemalardan saniyeler
              içinde bilet al, sırada beklemeden salona gir.
            </p>

            <div className="hero-actions">
              <Link to="/movies" className="btn btn--primary btn--lg">
                Bilet Al
              </Link>
            </div>

            <dl className="hero-stats">
              <div className="hero-stat">
                <dt>Film</dt>
                <dd data-testid="hero-stat-movies">
                  {moviesLoading ? "—" : activeMovies.length}
                </dd>
              </div>

              <div className="hero-stat">
                <dt>Şehir</dt>
                <dd data-testid="hero-stat-cities">{cities.length}</dd>
              </div>

              <div className="hero-stat">
                <dt>Kullanıcı Puanı</dt>
                <dd data-testid="hero-stat-rating">
                  {averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="hero-posters" aria-hidden="true">
            {heroPosters.map((movie, index) => (
              <img
                key={movie.id}
                src={movie.poster}
                alt=""
                className={`hero-poster hero-poster-${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <QuickTicketStrip
        movies={nowShowingMovies}
        cities={cities}
        onSubmit={handleQuickTicketSubmit}
      />

      <Rail
        title="Vizyondaki Filmler"
        viewAllHref="/movies"
        ariaLabel="Vizyondaki filmler"
      >
        {moviesLoading ? (
          <StatusPanel variant="loading" title="Filmler yükleniyor…" />
        ) : nowShowingMovies.length === 0 ? (
          <EmptyState icon="🎬" title="Şu anda vizyonda film bulunmuyor." />
        ) : (
          nowShowingMovies
            .slice(0, 12)
            .map((movie) => (
              <RailMovieCard
                key={movie.id}
                movie={movie}
                onSelect={handleMovieSelect}
              />
            ))
        )}
      </Rail>

      <Rail
        title="Yakında"
        viewAllHref="/movies"
        ariaLabel="Yakında vizyona girecek filmler"
      >
        {moviesLoading ? (
          <StatusPanel variant="loading" title="Filmler yükleniyor…" />
        ) : comingSoonMovies.length === 0 ? (
          <EmptyState
            icon="🎬"
            title="Yakında vizyona girecek film bulunmuyor."
          />
        ) : (
          comingSoonMovies
            .slice(0, 12)
            .map((movie) => (
              <RailMovieCard
                key={movie.id}
                movie={movie}
                onSelect={handleMovieSelect}
              />
            ))
        )}
      </Rail>

      {campaigns.length > 0 && (
        <section className="landing-section" aria-label="Kampanyalar">
          <div className="rail-section-heading">
            <h2 className="rail-section-title">Kampanyalar</h2>
            <Link to="/campaigns" className="rail-section-link">
              Tümünü gör →
            </Link>
          </div>

          <div className="campaign-grid">
            {campaigns.slice(0, 3).map((campaign) => (
              <article key={campaign.id} className="campaign-card">
                <span className="badge badge--accent">
                  {formatCampaignValue(campaign)}
                </span>

                <h3 className="campaign-card-title">{campaign.name}</h3>

                <p className="campaign-card-condition">
                  {campaign.minCartTotal > 0
                    ? `${campaign.minCartTotal.toFixed(2)} TL ve üzeri sepetlerde geçerli`
                    : "Tüm sepetlerde geçerli"}
                </p>

                {campaign.membersOnly && (
                  <span className="badge badge--neutral">
                    Yalnızca üyelere özel
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default HomePage;
```

- [ ] **Step 3: HomePage.test.jsx'i genişlet**

Task 6'da yazılan `HomePage.test.jsx`'in üzerine, aynı dosyanın en üstündeki import/mock bloğunu şu hale getir (campaignService mock'u eklendi, `within` eklendi — yeni rail testlerinde kullanılıyor; `waitFor` Task 6'dan beri zaten kullanılıyor, korunuyor):

```jsx
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
import { beforeEach, describe, expect, it, vi } from "vitest";

import movieService from "../services/movieService.js";
import campaignService from "../services/campaignService.js";
import { cityResource } from "../services/locationService.js";
import HomePage from "./HomePage.jsx";

vi.mock("../services/movieService.js", async () => {
  const actual = await vi.importActual("../services/movieService.js");
  return { default: { ...actual.default, getMovies: vi.fn() } };
});

vi.mock("../services/campaignService.js", async () => {
  const actual = await vi.importActual("../services/campaignService.js");
  return {
    ...actual,
    default: { ...actual.default, getActiveCampaigns: vi.fn() },
  };
});

vi.mock("../services/locationService.js", () => ({
  cityResource: { list: vi.fn() },
}));
```

`isoDateOffsetFromToday`, `MOVIES`, `CITIES`, `renderHomePage` aynı kalır — tek fark `renderHomePage`'in kullandığı `beforeEach`'e artık `campaignService.getActiveCampaigns.mockResolvedValue([])` varsayılanı eklenmesi (aksi halde bu servis mock'lanmamış promise asla resolve olmadığı için ilgisiz testler asılı kalabilir):

Mevcut `describe("HomePage — Hero ve hızlı bilet şeridi", ...)` bloğunun `beforeEach`'ini şuna güncelle:

```jsx
  beforeEach(() => {
    vi.clearAllMocks();
    movieService.getMovies.mockResolvedValue(MOVIES);
    cityResource.list.mockResolvedValue(CITIES);
    campaignService.getActiveCampaigns.mockResolvedValue([]);
  });
```

Aynı dosyanın SONUNA (mevcut son `describe` bloğundan sonra) iki yeni `describe` bloğu ekle:

```jsx
describe("HomePage — Vizyondaki Filmler ve Yakında rayları", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cityResource.list.mockResolvedValue(CITIES);
    campaignService.getActiveCampaigns.mockResolvedValue([]);
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

    // Sayfa genelinde "Neon Yağmuru" araması hızlı bilet şeridinin Film
    // <select>'indeki <option>'a da eşleşip "Found multiple elements"
    // hatası verir — bu yüzden aramayı rail'in <section>'ıyla sınırla.
    const rail = (
      await screen.findByRole("heading", { name: "Vizyondaki Filmler" })
    ).closest("section");

    fireEvent.click(await within(rail).findByText("Neon Yağmuru"));

    expect(
      await screen.findByText("Film detay sayfası")
    ).toBeInTheDocument();
  });
});

describe("HomePage — Kampanyalar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    movieService.getMovies.mockResolvedValue(MOVIES);
    cityResource.list.mockResolvedValue(CITIES);
  });

  it("aktif kampanyaları kart olarak gösterir", async () => {
    campaignService.getActiveCampaigns.mockResolvedValue([
      {
        id: 1,
        name: "Hafta Sonu İndirimi",
        type: "Percentage",
        value: 20,
        minCartTotal: 0,
        membersOnly: false,
        isActive: true,
      },
    ]);

    renderHomePage();

    expect(
      await screen.findByText("Hafta Sonu İndirimi")
    ).toBeInTheDocument();
    expect(screen.getByText("%20")).toBeInTheDocument();
    expect(screen.getByText("Tüm sepetlerde geçerli")).toBeInTheDocument();
  });

  it("yalnızca üyelere özel kampanyada rozet gösterir", async () => {
    campaignService.getActiveCampaigns.mockResolvedValue([
      {
        id: 2,
        name: "Üye Kampanyası",
        type: "FixedAmount",
        value: 50,
        minCartTotal: 100,
        membersOnly: true,
        isActive: true,
      },
    ]);

    renderHomePage();

    expect(
      await screen.findByText("Yalnızca üyelere özel")
    ).toBeInTheDocument();
    expect(
      screen.getByText("100.00 TL ve üzeri sepetlerde geçerli")
    ).toBeInTheDocument();
  });

  it("aktif kampanya yoksa Kampanyalar bölümünü hiç göstermez", async () => {
    campaignService.getActiveCampaigns.mockResolvedValue([]);

    renderHomePage();

    await screen.findByTestId("hero-stat-movies");

    expect(screen.queryByText("Kampanyalar")).not.toBeInTheDocument();
  });
});
```

Dosyanın en üstündeki import listesine `within` eklenmesi gerekiyor — `import { fireEvent, render, screen, within } from "@testing-library/react";` (yukarıdaki import bloğunda zaten bu şekilde).

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- HomePage.test.jsx`
Expected: 11/11 PASS

- [ ] **Step 5: Lint ve commit**

```bash
npm run lint
git add frontend/src/pages/HomePage.jsx frontend/src/pages/HomePage.test.jsx frontend/src/pages/home.css
git commit -m "feat(frontend): landing'e Vizyondaki Filmler/Yakında rayları ve Kampanyalar bölümünü ekle"
```

---

### Task 8: Landing — Sana Yakın Sinemalar + Nasıl Çalışır + faz kapanışı

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx` (tamamı — Task 7'nin üzerine büyür, son hali)
- Modify: `frontend/src/pages/home.css` (Task 7'nin sonuna ekleniyor, son hali)
- Modify: `frontend/src/pages/HomePage.test.jsx` (tamamı — Task 7'nin üzerine büyür, son hali)

**Interfaces:**
- Consumes: `useNearestCinemas` (`hooks/useNearestCinemas.js`, Görev 2).

Bu, Faz 2'nin son görevi — spec §7.1'deki 7 landing bölümünün tamamı bu görev sonunda tamamlanmış olur (Hero, Vizyondaki Filmler, Yakında, Kampanyalar, Sana Yakın Sinemalar, Nasıl Çalışır, Footer — Footer zaten Faz 1'den beri `Layout.jsx` üzerinden geliyor).

- [ ] **Step 1: home.css'e son iki bölümün stillerini ekle**

Dosyanın SONUNA ekle:

```css

/* Sana Yakın Sinemalar -------------------------------------------------- */

.nearby-cinemas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-5);
}

.nearby-cinema-card {
  padding: var(--space-6);

  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.nearby-cinema-card h3 {
  margin: 0 0 var(--space-1);

  color: var(--color-text);
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
}

.nearby-cinema-city {
  margin: 0 0 var(--space-2);

  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.nearby-cinema-distance {
  margin: 0;

  color: var(--color-purple);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}

/* Nasıl Çalışır? ---------------------------------------------------- */

.how-it-works-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-6);

  margin: 0;
  padding: 0;

  list-style: none;
}

.how-it-works-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.how-it-works-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;

  background: var(--color-accent-soft);
  color: var(--color-yellow-text);
  border-radius: var(--radius-pill);

  font-size: var(--text-md);
  font-weight: var(--weight-black);
}

.how-it-works-step h3 {
  margin: 0;

  color: var(--color-text);
  font-size: var(--text-md);
  font-weight: var(--weight-bold);
}

.how-it-works-step p {
  margin: 0;

  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
```

- [ ] **Step 2: HomePage.jsx'i tamamla**

Dosyanın TAM son hali (Task 7'nin üzerine `useNearestCinemas` import'u, iki yeni bölüm ve statik `HOW_IT_WORKS_STEPS` sabiti eklendi):

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import movieService from "../services/movieService.js";
import campaignService, {
  formatCampaignValue,
} from "../services/campaignService.js";
import { cityResource } from "../services/locationService.js";
import useNearestCinemas from "../hooks/useNearestCinemas.js";
import Rail from "../components/ui/Rail.jsx";
import RailMovieCard from "../components/movies/RailMovieCard.jsx";
import StatusPanel from "../components/ui/StatusPanel.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import heroPoster from "../assets/hero.png";

import "./home.css";

const HOW_IT_WORKS_STEPS = [
  {
    title: "Filmini seç",
    description:
      "Vizyondaki ve yakında gelecek filmler arasından birini seç.",
  },
  {
    title: "Koltuğunu seç",
    description: "Salon haritasından istediğin koltuğu işaretle.",
  },
  {
    title: "Biletin hazır",
    description: "Ödemeni tamamla, biletin anında hesabına düşsün.",
  },
];

function QuickTicketStrip({ movies, cities, onSubmit }) {
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ city: selectedCity, movieId: selectedMovieId });
  }

  return (
    <form className="quick-ticket-strip" onSubmit={handleSubmit}>
      <label className="quick-ticket-field">
        <span>Şehir</span>
        <select
          className="input"
          value={selectedCity}
          onChange={(event) => setSelectedCity(event.target.value)}
        >
          <option value="">Şehir seç</option>
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <label className="quick-ticket-field">
        <span>Film</span>
        <select
          className="input"
          value={selectedMovieId}
          onChange={(event) => setSelectedMovieId(event.target.value)}
        >
          <option value="">Film seç</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
      </label>

      <label className="quick-ticket-field">
        <span>Tarih</span>
        {/* Backend'de şehir+film+tarih birleşik seans sorgusu yok (spec
            §11 — bu revizyon hiçbir backend değişikliği içermiyor), bu
            yüzden tarih şimdilik yalnızca bilgi amaçlı; "Seansları Bul"
            yönlendirmesi film/şehir seçimine göre çalışır. */}
        <input
          className="input"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </label>

      <button
        type="submit"
        className="btn btn--primary btn--md quick-ticket-submit"
      >
        Seansları Bul
      </button>
    </form>
  );
}

function HomePage() {
  const navigate = useNavigate();

  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => cityResource.list(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", "active"],
    queryFn: campaignService.getActiveCampaigns,
    staleTime: 5 * 60 * 1000,
  });

  const {
    cinemas: nearestCinemas,
    isLoading: cinemasLoading,
    hasLocation,
    locationStatus,
  } = useNearestCinemas();

  const activeMovies = movies.filter(
    (movie) => !movieService.isMovieArchived(movie)
  );
  const nowShowingMovies = activeMovies.filter((movie) =>
    movieService.isMovieReleased(movie)
  );
  const comingSoonMovies = activeMovies.filter(
    (movie) =>
      !movieService.isMovieReleased(movie) &&
      movieService.isWithinComingSoonWindow(movie)
  );
  const heroPosters = movieService
    .sortMovies(nowShowingMovies, "rating-desc")
    .slice(0, 3);

  const averageRating =
    activeMovies.length > 0
      ? activeMovies.reduce(
          (sum, movie) => sum + (movie.rating?.average ?? 0),
          0
        ) / activeMovies.length
      : 0;

  function handleQuickTicketSubmit({ city, movieId }) {
    if (movieId) {
      navigate(`/movies/${movieId}`);
      return;
    }

    if (city) {
      navigate("/cinemas", { state: { city } });
      return;
    }

    navigate("/movies");
  }

  function handleMovieSelect(movieId) {
    navigate(`/movies/${movieId}`);
  }

  return (
    <div className="landing">
      <section
        className="hero"
        style={{ backgroundImage: `url(${heroPoster})` }}
      >
        <div className="hero-inner">
          <div className="hero-message">
            <span className="hero-eyebrow">CineSeat</span>

            <h1 className="hero-title">
              Bileti telefonundan al, koltuğunu önceden seç.
            </h1>

            <p className="hero-description">
              Türkiye&apos;nin dört bir yanındaki sinemalardan saniyeler
              içinde bilet al, sırada beklemeden salona gir.
            </p>

            <div className="hero-actions">
              <Link to="/movies" className="btn btn--primary btn--lg">
                Bilet Al
              </Link>
            </div>

            <dl className="hero-stats">
              <div className="hero-stat">
                <dt>Film</dt>
                <dd data-testid="hero-stat-movies">
                  {moviesLoading ? "—" : activeMovies.length}
                </dd>
              </div>

              <div className="hero-stat">
                <dt>Şehir</dt>
                <dd data-testid="hero-stat-cities">{cities.length}</dd>
              </div>

              <div className="hero-stat">
                <dt>Kullanıcı Puanı</dt>
                <dd data-testid="hero-stat-rating">
                  {averageRating > 0 ? `${averageRating.toFixed(1)}/5` : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="hero-posters" aria-hidden="true">
            {heroPosters.map((movie, index) => (
              <img
                key={movie.id}
                src={movie.poster}
                alt=""
                className={`hero-poster hero-poster-${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <QuickTicketStrip
        movies={nowShowingMovies}
        cities={cities}
        onSubmit={handleQuickTicketSubmit}
      />

      <Rail
        title="Vizyondaki Filmler"
        viewAllHref="/movies"
        ariaLabel="Vizyondaki filmler"
      >
        {moviesLoading ? (
          <StatusPanel variant="loading" title="Filmler yükleniyor…" />
        ) : nowShowingMovies.length === 0 ? (
          <EmptyState icon="🎬" title="Şu anda vizyonda film bulunmuyor." />
        ) : (
          nowShowingMovies
            .slice(0, 12)
            .map((movie) => (
              <RailMovieCard
                key={movie.id}
                movie={movie}
                onSelect={handleMovieSelect}
              />
            ))
        )}
      </Rail>

      <Rail
        title="Yakında"
        viewAllHref="/movies"
        ariaLabel="Yakında vizyona girecek filmler"
      >
        {moviesLoading ? (
          <StatusPanel variant="loading" title="Filmler yükleniyor…" />
        ) : comingSoonMovies.length === 0 ? (
          <EmptyState
            icon="🎬"
            title="Yakında vizyona girecek film bulunmuyor."
          />
        ) : (
          comingSoonMovies
            .slice(0, 12)
            .map((movie) => (
              <RailMovieCard
                key={movie.id}
                movie={movie}
                onSelect={handleMovieSelect}
              />
            ))
        )}
      </Rail>

      {campaigns.length > 0 && (
        <section className="landing-section" aria-label="Kampanyalar">
          <div className="rail-section-heading">
            <h2 className="rail-section-title">Kampanyalar</h2>
            <Link to="/campaigns" className="rail-section-link">
              Tümünü gör →
            </Link>
          </div>

          <div className="campaign-grid">
            {campaigns.slice(0, 3).map((campaign) => (
              <article key={campaign.id} className="campaign-card">
                <span className="badge badge--accent">
                  {formatCampaignValue(campaign)}
                </span>

                <h3 className="campaign-card-title">{campaign.name}</h3>

                <p className="campaign-card-condition">
                  {campaign.minCartTotal > 0
                    ? `${campaign.minCartTotal.toFixed(2)} TL ve üzeri sepetlerde geçerli`
                    : "Tüm sepetlerde geçerli"}
                </p>

                {campaign.membersOnly && (
                  <span className="badge badge--neutral">
                    Yalnızca üyelere özel
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="landing-section" aria-label="Sana yakın sinemalar">
        <div className="rail-section-heading">
          <h2 className="rail-section-title">Sana Yakın Sinemalar</h2>
          <Link to="/cinemas" className="rail-section-link">
            Tümünü gör →
          </Link>
        </div>

        {cinemasLoading ? (
          <StatusPanel variant="loading" title="Sinemalar yükleniyor…" />
        ) : !hasLocation ? (
          <EmptyState
            icon="📍"
            title="Size en yakın sinemaları göstermek için konum izni gerekiyor."
            description={locationStatus}
            action={
              <Link to="/cinemas" className="btn btn--secondary btn--sm">
                Tüm sinemaları gör
              </Link>
            }
          />
        ) : (
          <div className="nearby-cinemas-grid">
            {nearestCinemas.slice(0, 3).map((cinema) => (
              <article key={cinema.id} className="nearby-cinema-card">
                <h3>{cinema.name}</h3>
                <p className="nearby-cinema-city">{cinema.city}</p>
                <p className="nearby-cinema-distance">
                  {cinema.distance.toFixed(1)} km uzaklıkta
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="landing-section" aria-label="Nasıl çalışır">
        <div className="rail-section-heading">
          <h2 className="rail-section-title">Nasıl Çalışır?</h2>
        </div>

        <ol className="how-it-works-list">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title} className="how-it-works-step">
              <span className="how-it-works-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default HomePage;
```

- [ ] **Step 3: HomePage.test.jsx'i tamamla**

Task 7'de yazılan `HomePage.test.jsx`'in en üstündeki import/mock bloğuna `cinemaService` mock'unu ekle (dosyanın en üstü, mevcut `vi.mock` çağrılarının yanına):

```jsx
vi.mock("../services/cinemaService.js", () => ({
  default: { getCinemas: vi.fn() },
}));
```

Ve importlara ekle:

```jsx
import cinemaService from "../services/cinemaService.js";
```

Mevcut tüm `describe` bloklarının `beforeEach`'lerine (dört blok: "Hero ve hızlı bilet şeridi", "Vizyondaki Filmler ve Yakında rayları", "Kampanyalar") `cinemaService.getCinemas.mockResolvedValue([]);` satırını ekle — aksi halde `useNearestCinemas`'ın iç sorgusu mock'lanmamış kalır. Örneğin "Hero ve hızlı bilet şeridi" bloğunun `beforeEach`'i şu hale gelir:

```jsx
  beforeEach(() => {
    vi.clearAllMocks();
    movieService.getMovies.mockResolvedValue(MOVIES);
    cityResource.list.mockResolvedValue(CITIES);
    campaignService.getActiveCampaigns.mockResolvedValue([]);
    cinemaService.getCinemas.mockResolvedValue([]);
  });
```

Aynı satırı diğer üç `describe` bloğunun `beforeEach`'lerine de ekle.

Dosyanın SONUNA yeni bir `describe` bloğu ekle:

```jsx
describe("HomePage — Sana Yakın Sinemalar ve Nasıl Çalışır", () => {
  const originalGeolocation = navigator.geolocation;

  beforeEach(() => {
    vi.clearAllMocks();
    movieService.getMovies.mockResolvedValue(MOVIES);
    cityResource.list.mockResolvedValue(CITIES);
    campaignService.getActiveCampaigns.mockResolvedValue([]);
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
```

Dosyanın en üstündeki `vitest` import satırına `afterEach` eklenmesi gerekiyor: `import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";`.

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- HomePage.test.jsx`
Expected: 14/14 PASS

- [ ] **Step 5: Faz kapanışı — tüm suite + build**

Spec §9 kuralı: her faz sonunda lint/test/build yeşil olmadan bir sonraki faza geçilmez. Bu adım Faz 2'nin tamamını kapatır.

Run: `npm run lint`
Expected: 0 hata

Run: `npm run test:run`
Expected: tüm suite PASS (Faz 0+1'den kalan testler + bu fazda eklenen/taşınan testler)

Run: `npm run build`
Expected: hatasız tamamlanır

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/HomePage.jsx frontend/src/pages/HomePage.test.jsx frontend/src/pages/home.css
git commit -m "feat(frontend): landing'e Sana Yakın Sinemalar ve Nasıl Çalışır bölümlerini ekleyerek Faz 2'yi tamamla"
```
