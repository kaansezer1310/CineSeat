# Frontend Faz 1 — Header/Footer Kabuğu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CineSeat frontend'inin kabuğunu (Header, Footer, MobileMenu, Layout) sıfırdan, Faz 0'ın token/primitif katmanı üzerine kurmak; mevcut tek-dosyalık `Layout.jsx`'i odaklı bileşenlere bölmek; header'ı açık yüzeye, footer'ı koyu zemine çevirmek (spec §6'nın bilinçli tersine çevirmesi).

**Architecture:** `components/layout/` altında yedi yeni bileşen (Header, Footer, MobileMenu, CitySelector, CartButton, UserMenu, ThemeToggle) + paylaşılan bir `useDismissableOverlay` hook'u (aç/kapa + dışarı tıklama + Escape mantığını tekilleştirir — üç ayrı bileşen aynı deseni tekrar etmesin diye). Tüm yeni bileşenler Faz 0'ın `.btn`/`.chip`/`.icon-btn` primitiflerini tüketir; header cluster'ının kendine özgü stilleri tek bir `Header.css` dosyasında toplanır (mevcut `cinemas.css` co-location deseniyle tutarlı). `Layout.jsx` küçülür: yalnızca skip-link + Header + `<Outlet>` + Footer'ı sarar.

**Tech Stack:** React 19, React Router 7, TanStack Query (CitySelector için), Vite 8, Vitest 4 + Testing Library, düz CSS (Faz 0'ın token katmanı üzerine).

**Spec:** [`docs/superpowers/specs/2026-08-27-frontend-ui-revizyonu-design.md`](../specs/2026-08-27-frontend-ui-revizyonu-design.md) — bu plan spec'in §6 (Kabuk: Header + Footer) ve §10 Faz 1 satırını uygular.

## Global Constraints

- Bu plan Faz 0'ın üzerine kurulur (token'lar, `base.css`, `primitives.css`, `utilities.css` zaten mevcut ve stabil — spec §4/§10). Mevcut `--color-*`/`--space-*`/`--radius-*`/... token adları **değiştirilmez**; yalnızca gerektiğinde yeni token eklenir.
- Yeni primitif class'lar `primitives.css`'e eklenebilir (`.icon-btn`, `.icon-btn-badge`) — Faz 0'ın primitif seti "kilitli" değil, genişletilebilir; ama var olan class'lar (`.btn`, `.card`, `.chip`, `.badge`, `.input`, `.skeleton`) **değiştirilmez**, yalnızca tüketilir.
- **Bilinçli davranış değişikliği (spec §6, kullanıcı onaylı):** Header artık açık yüzey (`var(--color-surface)` + alt kenarlık), footer koyu zemin. Eski `--color-header-*` token'ları (temadan bağımsız koyu) artık Header tarafından **kullanılmaz** — bu görev onları primitives/tokens'tan silmez (Faz 0'da "Faz 1'e kadar sabit kalır" notuyla bırakılmıştı), sadece Header.jsx onları tüketmeyi bırakır. Bu token'ların App.css'teki TEK tüketicisi (eski Layout/nav kuralları) bu planda tamamen kaldırıldığı için, `--color-header-*` bu fazdan sonra **hiçbir yerde kullanılmaz hale gelir** — bu bilinçli bir "kullanılmayan token" durumu, hata değil (spec ileride footer/header rolü daha da netleşince bu token'lar ya yeniden kullanılır ya da temizlenir; bu planın kapsamı değil).
- Yeni statik sayfalar (`/about`, `/campaigns`, vb.) bu fazda **oluşturulmaz** (Faz 2/4'ün işi). Header/Footer bu rotalara gerçek `<Link>`/`<NavLink>` ile bağlanır; rota henüz yoksa mevcut `NotFoundPage` (App.jsx'teki `<Route path="*">`) devreye girer — bu, aşamalı teslimatta normal ve kabul edilebilir bir ara durumdur, "kırık link" değildir.
- Arama ikonu bu fazda **eklenmez** — spec §6 "arama ikonu" der ama gerçek bir arama hedefi (bir `/movies` sayfası, filtre state'i) henüz yok; sahte/işlevsiz bir ikon eklemek yerine bu, arama hedefinin gerçekten var olacağı faza (Faz 2) bırakılıyor.
- Her görevin sonunda `npm run test:run` **ve** `npm run lint` yeşil olmalı; bu fazın SON görevinden sonra ayrıca `npm run build`'un da yeşil olması zorunlu.
- Mevcut testlerin **çoğu taşınır, silinmez**: eski `Layout.test.jsx`'teki Yönetim-linki/aktif-sayfa/href testleri artık nav'ı barındıran `Header.test.jsx`'e taşınır (aynı senaryolar, yeni bileşen üzerinden).

---

## File Structure

```
frontend/src/
  hooks/
    useDismissableOverlay.js        [CREATE]
    useDismissableOverlay.test.js   [CREATE]
  components/layout/
    ThemeToggle.jsx                 [CREATE]
    ThemeToggle.test.jsx            [CREATE]
    CartButton.jsx                  [CREATE]
    CartButton.test.jsx             [CREATE]
    UserMenu.jsx                    [CREATE]
    UserMenu.test.jsx               [CREATE]
    CitySelector.jsx                [CREATE]
    CitySelector.test.jsx           [CREATE]
    MobileMenu.jsx                  [CREATE]
    MobileMenu.test.jsx             [CREATE]
    Header.jsx                      [CREATE]
    Header.css                      [CREATE]
    Header.test.jsx                 [CREATE]
    Footer.jsx                      [CREATE]
    Footer.css                      [CREATE]
    Footer.test.jsx                 [CREATE]
    Layout.jsx                      [MODIFY — tamamen yeniden yazılır]
    Layout.test.jsx                 [MODIFY — tamamen yeniden yazılır]
  styles/
    primitives.css                  [MODIFY — .icon-btn, .icon-btn-badge eklenir]
    primitives.test.js               [MODIFY]
    base.css                        [MODIFY — .app-shell, .skip-link eklenir]
    base.test.js                    [MODIFY]
    tokens.css                      [MODIFY — --color-footer-* eklenir]
    tokens.test.js                  [MODIFY]
  App.css                           [MODIFY — ölü header/nav kuralları silinir]
```

---

### Task 1: Eski header/nav CSS'inin temizlenmesi + `.icon-btn`/`.icon-btn-badge` primitifleri

Bu görev iki bağımsız ama küçük değişikliği birlikte yapar: (a) `App.css`'te artık hiçbir JSX'in kullanmadığı 5 ölü kural bloğunu siler (controller doğruladı: bu class'lar `Layout.jsx` dışında hiçbir dosyada kullanılmıyor), (b) sonraki tüm görevlerin ihtiyaç duyacağı iki yeni primitif ekler.

**Files:**
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/styles/primitives.css`
- Modify: `frontend/src/styles/primitives.test.js`

**Interfaces:**
- Consumes: Faz 0'ın `--color-*`, `--space-*`, `--radius-*`, `--weight-*` token'ları.
- Produces: `.icon-btn`, `.icon-btn-badge` class'ları — Task 3 (ThemeToggle/CartButton), Task 6 (MobileMenu) bunları tüketir.

- [ ] **Step 1: `App.css`'ten ölü kuralları sil**

`frontend/src/App.css` içinde aşağıdaki 5 bloğu **tamamen sil** (her biri tam olarak gösterildiği gibi, satır satır):

Blok 1 — dosyanın başı (satır 1-64, boş satır 65 kalır):
```css
.app-shell {
  min-height: 100vh;
}

.main-header {
  position: sticky;
  top: 0;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 72px;
  padding: 0 6%;

  border-bottom: 1px solid var(--color-header-border);

  background: var(--color-header-background);
  backdrop-filter: blur(14px);
}

.logo {
  color: var(--color-header-text);

  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.main-navigation {
  display: flex;
  align-items: center;
  gap: 28px;
}

.main-navigation a {
  color: var(--color-header-text-muted);

  font-size: 0.95rem;
  font-weight: 500;

  transition:
    color 150ms ease,
    transform 150ms ease;
}

.main-navigation a:hover,
.main-navigation a:focus-visible {
  color: var(--color-header-accent);
  transform: translateY(-1px);
}

.main-navigation a:focus-visible,
.theme-toggle-button:focus-visible {
  outline: 2px solid var(--color-header-accent);
  outline-offset: 3px;
}

.page-container {
  width: min(1180px, 88%);
  margin: 0 auto;
  padding: 48px 0;
}
```

Blok 2 — `@media (max-width: 650px)` içindeki ilk üç kural (yalnızca `.main-header`, `.main-navigation`, `.main-navigation a`, `.page-container` kurallarını kaldır; bu media query bloğunun İÇİNDE başka kurallar varsa onlara dokunma — bu tam blok dosyada tek başına duruyorsa bloğun tamamını sil):
```css
@media (max-width: 650px) {
  .main-header {
    padding: 0 5%;
  }

  .main-navigation {
    gap: 14px;
  }

  .main-navigation a {
    font-size: 0.8rem;
  }

  .page-container {
    width: 90%;
    padding-top: 32px;
  }
}
```

Blok 3 — sepet linki/rozeti:
```css
.cart-navigation-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.cart-count {
  display: grid;

  min-width: 22px;
  height: 22px;
  place-items: center;

  padding: 0 6px;

  border-radius: 999px;

  background: var(--color-yellow);
  color: #211a0b;

  font-size: 0.72rem;
  font-weight: 700;
}
```

Blok 4 — tema butonu (yalnızca bu iki kural; hemen üstündeki `SPRINT 3 - Theme Toggle, Watchlist Icon & Profile Styles` bölüm başlığı yorumuna **dokunma** — o yorum altındaki başka kuralları (Watchlist/Profile) da kapsıyor):
```css
/* Theme Toggle Button */
.theme-toggle-button {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: transform 150ms ease, background 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-button:hover {
  background: var(--color-header-hover-surface);
  transform: scale(1.1);
}
```

Blok 5 — aktif nav göstergesi + kullanıcı menüsü kalıntıları (yorum satırı dahil; hemen altındaki `/* --- Tembel yüklenen rotaların bekleme ekranı --- */` yorumuna ve devamına **dokunma**):
```css
/* --- Ana menü: aktif sayfa göstergesi (Y4) ------------------------------- */
.main-navigation-link {
  position: relative;
  padding-bottom: 2px;
}

/* NavLink `<a>` olarak render edilir; `.main-navigation a` kuralını
   geçebilmek için seçici bilerek bu özgüllükte. */
.main-navigation a.main-navigation-link-active {
  color: var(--color-header-accent);
  font-weight: 600;
}

.main-navigation a.main-navigation-link-active::after {
  content: "";

  position: absolute;
  right: 0;
  bottom: -6px;
  left: 0;

  height: 2px;
  border-radius: 2px;

  background: var(--color-header-accent);
}

.main-navigation-greeting {
  color: var(--color-header-text-muted);

  font-size: 0.95rem;
}

.main-navigation-logout {
  padding: 0;

  border: none;
  background: transparent;
  color: var(--color-header-accent);

  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
}

.main-navigation-logout:hover {
  text-decoration: underline;
}

.main-navigation-logout:focus-visible {
  outline: 2px solid var(--color-header-accent);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Doğrula — hiçbir JSX artık bu class'ları kullanmıyor**

Çalıştır: `cd frontend && grep -rn "app-shell\|main-header\|main-navigation\|page-container\|cart-navigation-link\|cart-count\|theme-toggle-button" src --include=*.jsx`
Beklenen: **hiçbir sonuç yok** (Task 9 henüz `Layout.jsx`'i yeniden yazmadı, ama `Layout.jsx` şu an hâlâ bu class'ları kullanıyor olabilir — eğer bu grep `Layout.jsx` içinde eşleşme bulursa, bu adımı atla ve bu bilgiyi self-review'de not et; Task 9 zaten `Layout.jsx`'i tamamen değiştirecek).

- [ ] **Step 3: `primitives.test.js`'e yeni testleri ekle (FAIL beklenir)**

`frontend/src/styles/primitives.test.js` — mevcut son `it()` bloğundan sonra, `describe` kapanışından önce ekle:

```js
  it(".icon-btn ikon-only buton ve rozet varyantını tanımlar", () => {
    expect(css).toContain(".icon-btn {");
    expect(css).toContain("width: 38px;");
    expect(css).toContain(".icon-btn:hover {");
    expect(css).toContain(".icon-btn-badge {");
    expect(css).toContain("background: var(--color-yellow);");
  });
```

- [ ] **Step 4: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/primitives.test.js`
Beklenen: FAIL — `.icon-btn` henüz tanımlı değil.

- [ ] **Step 5: `.icon-btn`/`.icon-btn-badge`'i `primitives.css`'e ekle**

`frontend/src/styles/primitives.css` — dosyanın sonuna (`@media (prefers-reduced-motion: reduce) { ... }` bloğundan sonra) ekle:

```css

/* Icon-only buton (arama/sepet/tema/hamburger tetikleyicileri) */
.icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.icon-btn:hover {
  background: var(--color-border);
}

.icon-btn-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--color-yellow);
  color: var(--color-on-accent);
  font-size: 10px;
  font-weight: var(--weight-bold);
  line-height: 1;
}
```

- [ ] **Step 6: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/primitives.test.js`
Beklenen: PASS.

- [ ] **Step 7: Tüm test paketini, lint'i ve build'i çalıştır**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`
Beklenen: tüm testler PASS (Step 1'in App.css temizliği hiçbir mevcut testi bozmamalı — `Layout.jsx` hâlâ eski nav'ı render ediyor olsa da, testler class isimlerine değil erişilebilir role/text'e bakıyor), lint temiz, build başarılı.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/App.css frontend/src/styles/primitives.css frontend/src/styles/primitives.test.js
git commit -m "chore(frontend): ölü header/nav CSS'ini temizle, icon-btn primitifini ekle"
```

---

### Task 2: `useDismissableOverlay` hook'u

UserMenu, CitySelector ve MobileMenu'nün üçü de aynı deseni tekrar edecekti: açık/kapalı state, dışarı tıklayınca kapanma, Escape'e basınca kapanma. Bunu tek, test edilmiş bir hook'ta topluyoruz.

**Files:**
- Create: `frontend/src/hooks/useDismissableOverlay.js`
- Test: `frontend/src/hooks/useDismissableOverlay.test.js`

**Interfaces:**
- Consumes: yok (React'in kendi `useState`/`useRef`/`useEffect`'i).
- Produces: `{ isOpen, open, close, toggle, containerRef }` — Task 4 (UserMenu), Task 5 (CitySelector), Task 6 (MobileMenu) bunu tüketir. `containerRef`, `null` bırakılırsa (MobileMenu'nün yaptığı gibi) dışarı-tıklama mantığı sessizce devre dışı kalır — Escape hâlâ çalışır.

- [ ] **Step 1: Testi yaz (FAIL beklenir)**

`frontend/src/hooks/useDismissableOverlay.test.js`:

```jsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useDismissableOverlay from "./useDismissableOverlay.js";

function Harness() {
  const { isOpen, toggle, close, containerRef } = useDismissableOverlay();

  return (
    <div>
      <button type="button" onClick={toggle}>
        Aç/Kapa
      </button>

      <div ref={containerRef} data-testid="container">
        {isOpen && (
          <div data-testid="panel">
            <button type="button">İçerideki buton</button>
          </div>
        )}
      </div>

      <button type="button" onClick={close}>
        Elle kapat
      </button>

      <button type="button" data-testid="outside">
        Dışarıdaki buton
      </button>
    </div>
  );
}

describe("useDismissableOverlay", () => {
  it("başlangıçta kapalıdır", () => {
    render(<Harness />);

    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });

  it("toggle ile açılır ve kapanır", () => {
    render(<Harness />);

    fireEvent.click(screen.getByText("Aç/Kapa"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Aç/Kapa"));
    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });

  it("konteynerin dışına tıklanınca kapanır", () => {
    render(<Harness />);

    fireEvent.click(screen.getByText("Aç/Kapa"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));

    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });

  it("konteynerin içine tıklanınca kapanmaz", () => {
    render(<Harness />);

    fireEvent.click(screen.getByText("Aç/Kapa"));
    fireEvent.mouseDown(screen.getByText("İçerideki buton"));

    expect(screen.getByTestId("panel")).toBeInTheDocument();
  });

  it("Escape tuşuna basılınca kapanır", () => {
    render(<Harness />);

    fireEvent.click(screen.getByText("Aç/Kapa"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/hooks/useDismissableOverlay.test.js`
Beklenen: FAIL — dosya yok.

- [ ] **Step 3: Hook'u oluştur**

`frontend/src/hooks/useDismissableOverlay.js`:

```js
import { useEffect, useRef, useState } from "react";

/**
 * Aç/kapa state'i + dışarı tıklama + Escape ile kapanma — UserMenu,
 * CitySelector ve MobileMenu'nün paylaştığı ortak açılır-panel deseni.
 * `containerRef` bağlanmazsa (tam ekran overlay'ler gibi) dışarı-tıklama
 * kontrolü sessizce devre dışı kalır; Escape her durumda çalışır.
 */
function useDismissableOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        close();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return { isOpen, open, close, toggle, containerRef };
}

export default useDismissableOverlay;
```

- [ ] **Step 4: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/hooks/useDismissableOverlay.test.js`
Beklenen: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/useDismissableOverlay.js frontend/src/hooks/useDismissableOverlay.test.js
git commit -m "feat(frontend): useDismissableOverlay hook'unu ekle"
```

---

### Task 3: `ThemeToggle.jsx` + `CartButton.jsx`

İkisi de tek amaçlı, hook gerektirmeyen küçük ikon butonlar — mevcut `useTheme`/`useCart` hook'larını doğrudan tüketirler. Tek görevde birlikte ele alınıyor çünkü ikisi de aynı basitlikte ve `.icon-btn` primitifini aynı şekilde kullanıyor.

**Files:**
- Create: `frontend/src/components/layout/ThemeToggle.jsx`
- Test: `frontend/src/components/layout/ThemeToggle.test.jsx`
- Create: `frontend/src/components/layout/CartButton.jsx`
- Test: `frontend/src/components/layout/CartButton.test.jsx`

**Interfaces:**
- Consumes: `useTheme()` → `{ theme, toggleTheme }` (mevcut, değişmedi); `useCart()` → `{ state }` (mevcut, değişmedi); `.icon-btn`/`.icon-btn-badge` (Task 1).
- Produces: `<ThemeToggle />`, `<CartButton />` — Task 7 (Header) bunları render eder.

- [ ] **Step 1: `ThemeToggle.test.jsx`'i yaz (FAIL beklenir)**

`frontend/src/components/layout/ThemeToggle.test.jsx`:

```jsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ThemeProvider from "../../context/ThemeProvider.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function renderToggle() {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe("ThemeToggle", () => {
  it("varsayılan light temada koyu temaya geçiş etiketini gösterir", () => {
    renderToggle();

    expect(
      screen.getByRole("button", { name: "Koyu temaya geç" })
    ).toBeInTheDocument();
  });

  it("tıklanınca temayı değiştirir ve etiketi günceller", () => {
    renderToggle();

    fireEvent.click(
      screen.getByRole("button", { name: "Koyu temaya geç" })
    );

    expect(
      screen.getByRole("button", { name: "Açık temaya geç" })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/ThemeToggle.test.jsx`
Beklenen: FAIL — dosya yok.

- [ ] **Step 3: `ThemeToggle.jsx`'i oluştur**

`frontend/src/components/layout/ThemeToggle.jsx`:

```jsx
import useTheme from "../../hooks/useTheme.js";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "light" ? "Koyu temaya geç" : "Açık temaya geç";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="icon-btn"
      title={label}
      aria-label={label}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

export default ThemeToggle;
```

- [ ] **Step 4: `ThemeToggle` testinin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/ThemeToggle.test.jsx`
Beklenen: PASS (2/2).

- [ ] **Step 5: `CartButton.test.jsx`'i yaz (FAIL beklenir)**

`frontend/src/components/layout/CartButton.test.jsx`:

```jsx
import { useEffect } from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import useCart from "../../hooks/useCart.js";
import { TICKET_TYPE } from "../../domain/ticketType.js";
import CartButton from "./CartButton.jsx";

function CartSeeder({ items }) {
  const { dispatch } = useCart();

  useEffect(() => {
    items.forEach((item) => {
      dispatch({ type: "ADD_TICKET", payload: item });
    });
  }, [items, dispatch]);

  return null;
}

function renderCartButton(items = []) {
  render(
    <MemoryRouter>
      <CartProvider>
        <CartSeeder items={items} />
        <CartButton />
      </CartProvider>
    </MemoryRouter>
  );
}

describe("CartButton", () => {
  it("sepet boşken rozet göstermez", () => {
    renderCartButton();

    expect(screen.getByRole("link", { name: "Sepet" })).toHaveAttribute(
      "href",
      "/cart"
    );
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("sepette bilet varken toplam koltuk sayısını rozette gösterir", () => {
    renderCartButton([
      {
        id: "session-101",
        sessionId: 101,
        movieId: 1,
        movieTitle: "Neon Yağmuru",
        date: "13 Temmuz",
        time: "13:30",
        hallName: "Salon 1",
        seats: [
          { seatId: "A1", ticketType: TICKET_TYPE.ADULT },
          { seatId: "A2", ticketType: TICKET_TYPE.STUDENT },
        ],
        unitPrice: 220,
      },
    ]);

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/CartButton.test.jsx`
Beklenen: FAIL — dosya yok.

- [ ] **Step 7: `CartButton.jsx`'i oluştur**

`frontend/src/components/layout/CartButton.jsx`:

```jsx
import { Link } from "react-router-dom";

import useCart from "../../hooks/useCart.js";

function CartButton() {
  const { state } = useCart();
  const totalTicketCount = state.items.reduce((total, item) => {
    return total + item.seats.length;
  }, 0);

  return (
    <Link to="/cart" className="icon-btn" aria-label="Sepet" title="Sepet">
      🛒
      {totalTicketCount > 0 && (
        <span className="icon-btn-badge">{totalTicketCount}</span>
      )}
    </Link>
  );
}

export default CartButton;
```

- [ ] **Step 8: `CartButton` testinin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/CartButton.test.jsx`
Beklenen: PASS (2/2).

- [ ] **Step 9: Tüm test paketini, lint'i ve build'i çalıştır**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`

- [ ] **Step 10: Commit**

```bash
git add frontend/src/components/layout/ThemeToggle.jsx frontend/src/components/layout/ThemeToggle.test.jsx \
        frontend/src/components/layout/CartButton.jsx frontend/src/components/layout/CartButton.test.jsx
git commit -m "feat(frontend): ThemeToggle ve CartButton bileşenlerini ekle"
```

---

### Task 4: `UserMenu.jsx`

Misafir: Giriş Yap / Kayıt Ol butonları. Giriş yapılmış: isim rozeti, tıklanınca Profilim + Çıkış içeren açılır panel.

**Files:**
- Create: `frontend/src/components/layout/UserMenu.jsx`
- Test: `frontend/src/components/layout/UserMenu.test.jsx`

**Interfaces:**
- Consumes: `useAuth()` → `{ user, logout }` (mevcut, değişmedi); `useDismissableOverlay()` (Task 2); `.btn`/`.chip` primitifleri (Faz 0).
- Produces: `<UserMenu />`, `.dropdown-panel`/`.dropdown-item`/`.dropdown-item--danger` class adları — Task 5 (CitySelector) `.dropdown-panel`/`.dropdown-item`'ı yeniden kullanır, Task 7 (Header.css) bu class'ların stilini tanımlar.

- [ ] **Step 1: Testi yaz (FAIL beklenir)**

`frontend/src/components/layout/UserMenu.test.jsx`:

```jsx
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import UserMenu from "./UserMenu.jsx";

const mockLogout = vi.fn();
let mockUser = null;

vi.mock("../../hooks/useAuth.js", () => ({
  default: () => ({ user: mockUser, logout: mockLogout }),
}));

function renderUserMenu() {
  render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>
  );
}

describe("UserMenu", () => {
  it("misafire Giriş Yap ve Kayıt Ol bağlantılarını gösterir", () => {
    mockUser = null;
    renderUserMenu();

    expect(
      screen.getByRole("link", { name: "Giriş Yap" })
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("link", { name: "Kayıt Ol" })
    ).toHaveAttribute("href", "/register");
  });

  it("giriş yapmış kullanıcıya isim düğmesini gösterir, panel kapalı başlar", () => {
    mockUser = { id: 1, name: "Ayşe" };
    renderUserMenu();

    expect(
      screen.getByRole("button", { name: /Ayşe/ })
    ).toBeInTheDocument();
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });

  it("düğmeye tıklayınca Profilim ve Çıkış içeren panel açılır", () => {
    mockUser = { id: 1, name: "Ayşe" };
    renderUserMenu();

    fireEvent.click(screen.getByRole("button", { name: /Ayşe/ }));

    expect(
      screen.getByRole("menuitem", { name: "Profilim" })
    ).toHaveAttribute("href", "/profile");
    expect(
      screen.getByRole("menuitem", { name: "Çıkış" })
    ).toBeInTheDocument();
  });

  it("Çıkış'a tıklayınca logout çağrılır ve panel kapanır", () => {
    mockUser = { id: 1, name: "Ayşe" };
    mockLogout.mockClear();
    renderUserMenu();

    fireEvent.click(screen.getByRole("button", { name: /Ayşe/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Çıkış" }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/UserMenu.test.jsx`
Beklenen: FAIL — dosya yok.

- [ ] **Step 3: `UserMenu.jsx`'i oluştur**

`frontend/src/components/layout/UserMenu.jsx`:

```jsx
import { Link } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import useDismissableOverlay from "../../hooks/useDismissableOverlay.js";

function UserMenu() {
  const { user, logout } = useAuth();
  const { isOpen, toggle, close, containerRef } = useDismissableOverlay();

  if (!user) {
    return (
      <div className="user-menu-guest">
        <Link to="/login" className="btn btn--ghost btn--sm">
          Giriş Yap
        </Link>
        <Link to="/register" className="btn btn--primary btn--sm">
          Kayıt Ol
        </Link>
      </div>
    );
  }

  function handleLogout() {
    close();
    logout();
  }

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="chip"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Hesap menüsü, ${user.name}`}
      >
        {user.name}
      </button>

      {isOpen && (
        <div className="dropdown-panel" role="menu">
          <Link
            to="/profile"
            className="dropdown-item"
            role="menuitem"
            onClick={close}
          >
            Profilim
          </Link>

          <button
            type="button"
            className="dropdown-item dropdown-item--danger"
            role="menuitem"
            onClick={handleLogout}
          >
            Çıkış
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
```

- [ ] **Step 4: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/UserMenu.test.jsx`
Beklenen: PASS (4/4).

- [ ] **Step 5: Tüm test paketini, lint'i ve build'i çalıştır**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/layout/UserMenu.jsx frontend/src/components/layout/UserMenu.test.jsx
git commit -m "feat(frontend): UserMenu bileşenini ekle"
```

---

### Task 5: `CitySelector.jsx`

Header'daki şehir seçici. `cityResource.list()` üzerinden (mevcut, `CinemasPage`'in zaten kullandığı, kimlik doğrulama gerektirmeyen uç) şehirleri çeker; seçim `/cinemas`'a router state ile yönlendirir. `CinemasPage.jsx` bu state'i bu fazda **okumuyor** (kapsam dışı, Faz 4/sonrası bir iyileştirme) — seçim yine de kullanıcıyı doğru sayfaya götürür, sadece ön-filtrelenmiş açılmaz.

**Files:**
- Create: `frontend/src/components/layout/CitySelector.jsx`
- Test: `frontend/src/components/layout/CitySelector.test.jsx`

**Interfaces:**
- Consumes: `cityResource.list()` (`frontend/src/services/locationService.js`, mevcut, değişmedi — `{id, name}` dizisi döner); `useDismissableOverlay()` (Task 2); `.chip`, `.dropdown-panel`/`.dropdown-item` (Task 4).
- Produces: `<CitySelector />` — Task 7 (Header) render eder.

- [ ] **Step 1: Testi yaz (FAIL beklenir)**

`frontend/src/components/layout/CitySelector.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/CitySelector.test.jsx`
Beklenen: FAIL — dosya yok.

- [ ] **Step 3: `CitySelector.jsx`'i oluştur**

`frontend/src/components/layout/CitySelector.jsx`:

```jsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { cityResource } from "../../services/locationService.js";
import useDismissableOverlay from "../../hooks/useDismissableOverlay.js";

function CitySelector() {
  const navigate = useNavigate();
  const { isOpen, toggle, close, containerRef } = useDismissableOverlay();

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: cityResource.list,
    staleTime: 30 * 60 * 1000,
  });

  function handleSelect(cityName) {
    close();
    navigate("/cinemas", { state: { city: cityName } });
  }

  return (
    <div className="city-selector" ref={containerRef}>
      <button
        type="button"
        className="chip"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        📍 Şehir Seç
      </button>

      {isOpen && (
        <div className="dropdown-panel" role="menu">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              className="dropdown-item"
              role="menuitem"
              onClick={() => handleSelect(city.name)}
            >
              {city.name}
            </button>
          ))}

          {cities.length === 0 && (
            <p className="city-selector-empty">Şehir bulunamadı</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CitySelector;
```

- [ ] **Step 4: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/CitySelector.test.jsx`
Beklenen: PASS (3/3).

- [ ] **Step 5: Tüm test paketini, lint'i ve build'i çalıştır**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/layout/CitySelector.jsx frontend/src/components/layout/CitySelector.test.jsx
git commit -m "feat(frontend): CitySelector bileşenini ekle"
```

---

### Task 6: `MobileMenu.jsx`

Hamburger tetikleyici + tam ekran kaydırmalı panel. Odak tuzağı (Tab döngüsü panel içinde kalır), Escape ile kapanma (`useDismissableOverlay` üzerinden), açıkken body scroll kilidi.

**Files:**
- Create: `frontend/src/components/layout/MobileMenu.jsx`
- Test: `frontend/src/components/layout/MobileMenu.test.jsx`

**Interfaces:**
- Consumes: `useAuth()`, `useDismissableOverlay()` (yalnızca `isOpen`/`toggle`/`close` — `containerRef` kullanılmaz, overlay'in kendisi tıklamayı yakalar), `PermissionGate` + `ADMIN_PERMISSIONS` (mevcut), `.icon-btn` (Task 1).
- Produces: `<MobileMenu />` — Task 7 (Header) render eder.

- [ ] **Step 1: Testi yaz (FAIL beklenir)**

`frontend/src/components/layout/MobileMenu.test.jsx`:

```jsx
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PERMISSIONS } from "../../constants/permissions.js";
import MobileMenu from "./MobileMenu.jsx";

const mockLogout = vi.fn();
let mockUser = null;

vi.mock("../../hooks/useAuth.js", () => ({
  default: () => ({
    user: mockUser,
    logout: mockLogout,
    hasPermission: (permission) =>
      (mockUser?.permissions ?? []).includes(permission),
  }),
}));

function renderMenu() {
  render(
    <MemoryRouter>
      <MobileMenu />
    </MemoryRouter>
  );
}

describe("MobileMenu", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("panel kapalı başlar", () => {
    mockUser = null;
    renderMenu();

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("tetikleyiciye tıklayınca nav linklerini gösterir", () => {
    mockUser = null;
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));

    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("href", "/cinemas");
    expect(
      screen.getByRole("link", { name: "Giriş Yap" })
    ).toBeInTheDocument();
  });

  it("misafire Yönetim bağlantısı göstermez", () => {
    mockUser = null;
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("yetkili kullanıcıya Yönetim bağlantısı gösterir", () => {
    mockUser = {
      id: 1,
      name: "Yönetici",
      permissions: [PERMISSIONS.RESERVATION_READ],
    };
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));

    expect(
      screen.getByRole("link", { name: "Yönetim" })
    ).toHaveAttribute("href", "/admin");
  });

  it("giriş yapmış kullanıcıya Çıkış butonunu gösterir, tıklayınca logout çağrılır ve panel kapanır", () => {
    mockUser = { id: 1, name: "Ayşe", permissions: [] };
    mockLogout.mockClear();
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    fireEvent.click(screen.getByRole("button", { name: "Çıkış" }));

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("Escape ile kapanır", () => {
    mockUser = null;
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("açıkken body scroll'unu kilitler, kapanınca serbest bırakır", () => {
    mockUser = null;
    renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Menüyü aç" }));
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Menüyü kapat" }));
    expect(document.body.style.overflow).toBe("");
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/MobileMenu.test.jsx`
Beklenen: FAIL — dosya yok.

- [ ] **Step 3: `MobileMenu.jsx`'i oluştur**

`frontend/src/components/layout/MobileMenu.jsx`:

```jsx
import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import useDismissableOverlay from "../../hooks/useDismissableOverlay.js";
import PermissionGate from "../routing/PermissionGate.jsx";
import { ADMIN_PERMISSIONS } from "../../constants/permissions.js";

function mobileNavLinkClass({ isActive }) {
  return isActive
    ? "mobile-menu-link mobile-menu-link-active"
    : "mobile-menu-link";
}

function MobileMenu() {
  const { user, logout } = useAuth();
  const { isOpen, toggle, close } = useDismissableOverlay();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.style.overflow = "hidden";

    const focusable = panelRef.current?.querySelectorAll(
      'a[href], button:not([disabled])'
    );
    focusable?.[0]?.focus();

    function trapFocus(event) {
      if (event.key !== "Tab" || !focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", trapFocus);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", trapFocus);
    };
  }, [isOpen]);

  function handleLogout() {
    close();
    logout();
  }

  return (
    <>
      <button
        type="button"
        className="icon-btn mobile-menu-trigger"
        onClick={toggle}
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-panel"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div className="mobile-menu-overlay" onClick={close}>
          <nav
            id="mobile-menu-panel"
            ref={panelRef}
            className="mobile-menu-panel"
            aria-label="Mobil menü"
            onClick={(event) => event.stopPropagation()}
          >
            <NavLink to="/" end className={mobileNavLinkClass} onClick={close}>
              Filmler
            </NavLink>
            <NavLink
              to="/cinemas"
              className={mobileNavLinkClass}
              onClick={close}
            >
              Sinemalar
            </NavLink>
            <NavLink
              to="/campaigns"
              className={mobileNavLinkClass}
              onClick={close}
            >
              Kampanyalar
            </NavLink>

            <PermissionGate permissions={ADMIN_PERMISSIONS} mode="any">
              <NavLink
                to="/admin"
                className={mobileNavLinkClass}
                onClick={close}
              >
                Yönetim
              </NavLink>
            </PermissionGate>

            <div className="mobile-menu-divider" />

            {user ? (
              <>
                <NavLink
                  to="/profile"
                  className={mobileNavLinkClass}
                  onClick={close}
                >
                  Profilim
                </NavLink>
                <button
                  type="button"
                  className="mobile-menu-link mobile-menu-logout"
                  onClick={handleLogout}
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={mobileNavLinkClass}
                  onClick={close}
                >
                  Giriş Yap
                </NavLink>
                <NavLink
                  to="/register"
                  className={mobileNavLinkClass}
                  onClick={close}
                >
                  Kayıt Ol
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

export default MobileMenu;
```

- [ ] **Step 4: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/MobileMenu.test.jsx`
Beklenen: PASS (7/7).

- [ ] **Step 5: Tüm test paketini, lint'i ve build'i çalıştır**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/layout/MobileMenu.jsx frontend/src/components/layout/MobileMenu.test.jsx
git commit -m "feat(frontend): MobileMenu bileşenini ekle"
```

---

### Task 7: `Header.jsx` + `Header.css`

Logo + 3 nav item (Filmler/Sinemalar/Kampanyalar, izinliyse Yönetim) + sağda CitySelector/CartButton/ThemeToggle/UserMenu + mobilde hamburger. Önceki 5 görevin bileşenlerini birleştirir.

**Files:**
- Create: `frontend/src/components/layout/Header.jsx`
- Create: `frontend/src/components/layout/Header.css`
- Test: `frontend/src/components/layout/Header.test.jsx`

**Interfaces:**
- Consumes: `ThemeToggle`, `CartButton`, `UserMenu`, `CitySelector`, `MobileMenu` (Task 3-6); `PermissionGate` + `ADMIN_PERMISSIONS` (mevcut).
- Produces: `<Header />`, `.dropdown-panel`/`.dropdown-item`/`.dropdown-item--danger`/`.mobile-menu-*`/`.icon-btn`/`.city-selector`/`.user-menu`'nün GÖRSEL tanımları (`Header.css`) — Task 4/5/6'nın bileşenleri bu class'ları zaten kullanıyordu, stil burada tanımlanıyor. Task 9 (Layout) `<Header />`'ı render eder.

- [ ] **Step 1: Testi yaz (FAIL beklenir)**

`frontend/src/components/layout/Header.test.jsx`:

```jsx
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CartProvider from "../../context/CartProvider.jsx";
import AuthProvider from "../../context/AuthProvider.jsx";
import ThemeProvider from "../../context/ThemeProvider.jsx";
import {
  ADMIN_PERMISSIONS,
  PERMISSIONS,
} from "../../constants/permissions.js";
import Header from "./Header.jsx";

// Header, CitySelector'ı render eder ve CitySelector cityResource.list()'i
// (gerçek bir HTTP isteği) çağırır — bu testler ağdan bağımsız kalsın diye
// mock'lanıyor (CitySelector.test.jsx'teki aynı desen).
vi.mock("../../services/locationService.js", () => ({
  cityResource: { list: () => Promise.resolve([]) },
}));

function renderHeader(initialPath = "/") {
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
                <Route path="*" element={<Header />} />
              </Routes>
            </AuthProvider>
          </CartProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function signIn(user) {
  sessionStorage.setItem("cineseat_user", JSON.stringify(user));
}

describe("Header", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("logo ana sayfaya bağlanır", () => {
    renderHeader();

    expect(
      screen.getByRole("link", { name: "CineSeat" })
    ).toHaveAttribute("href", "/");
  });

  it("üç ana nav öğesini gösterir", () => {
    renderHeader();

    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("href", "/cinemas");
    expect(
      screen.getByRole("link", { name: "Kampanyalar" })
    ).toHaveAttribute("href", "/campaigns");
  });

  it("aktif sayfayı aria-current ile işaretler", () => {
    renderHeader("/cinemas");

    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "Filmler" })
    ).not.toHaveAttribute("aria-current");
  });

  it("misafire Yönetim bağlantısı göstermez", () => {
    renderHeader();

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("izni olmayan üyeye Yönetim bağlantısı göstermez", () => {
    signIn({ id: 2, name: "Üye", role: "member" });
    renderHeader();

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("yönetim izni olan kullanıcıya Yönetim bağlantısı gösterir", () => {
    signIn({
      id: 3,
      name: "Moderatör",
      role: "member",
      permissions: [PERMISSIONS.COMMENT_MODERATE],
    });
    renderHeader();

    expect(
      screen.getByRole("link", { name: "Yönetim" })
    ).toHaveAttribute("href", "/admin");
  });

  it("tam yetkili kullanıcıya Yönetim bağlantısı gösterir", () => {
    signIn({
      id: 1,
      name: "Yönetici",
      role: "admin",
      permissions: [...ADMIN_PERMISSIONS],
    });
    renderHeader();

    expect(
      screen.getByRole("link", { name: "Yönetim" })
    ).toBeInTheDocument();
  });

  it("izinsiz admin rolüne Yönetim bağlantısı göstermez", () => {
    signIn({ id: 1, name: "Yönetici", role: "admin", permissions: [] });
    renderHeader();

    expect(
      screen.queryByRole("link", { name: "Yönetim" })
    ).not.toBeInTheDocument();
  });

  it("araç çubuğunda tema, sepet ve hesap kontrollerini render eder", () => {
    renderHeader();

    expect(
      screen.getByRole("button", { name: "Koyu temaya geç" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sepet" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Giriş Yap" })
    ).toBeInTheDocument();
  });

  it("mobil menü tetikleyicisini render eder", () => {
    renderHeader();

    expect(
      screen.getByRole("button", { name: "Menüyü aç" })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/Header.test.jsx`
Beklenen: FAIL — dosya yok.

- [ ] **Step 3: `Header.jsx`'i oluştur**

`frontend/src/components/layout/Header.jsx`:

```jsx
import { Link, NavLink } from "react-router-dom";

import CartButton from "./CartButton.jsx";
import CitySelector from "./CitySelector.jsx";
import MobileMenu from "./MobileMenu.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import UserMenu from "./UserMenu.jsx";
import PermissionGate from "../routing/PermissionGate.jsx";
import { ADMIN_PERMISSIONS } from "../../constants/permissions.js";

import "./Header.css";

function navLinkClass({ isActive }) {
  return isActive
    ? "header-nav-link header-nav-link-active"
    : "header-nav-link";
}

function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-logo">
          CineSeat
        </Link>

        <nav className="site-nav" aria-label="Ana menü">
          <NavLink to="/" end className={navLinkClass}>
            Filmler
          </NavLink>
          <NavLink to="/cinemas" className={navLinkClass}>
            Sinemalar
          </NavLink>
          <NavLink to="/campaigns" className={navLinkClass}>
            Kampanyalar
          </NavLink>

          <PermissionGate permissions={ADMIN_PERMISSIONS} mode="any">
            <NavLink to="/admin" className={navLinkClass}>
              Yönetim
            </NavLink>
          </PermissionGate>
        </nav>

        <div className="site-header-tools">
          <CitySelector />
          <CartButton />
          <ThemeToggle />
          <UserMenu />
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}

export default Header;
```

- [ ] **Step 4: `Header.css`'i oluştur**

`frontend/src/components/layout/Header.css`:

```css
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);

  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(14px);
}

.site-header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-6);

  max-width: var(--container-xl);
  margin-inline: auto;
  padding: var(--space-3) var(--space-5);
}

.site-logo {
  font-size: var(--text-lg);
  font-weight: var(--weight-black);
  color: var(--color-purple);
  letter-spacing: -0.03em;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  margin-right: auto;
}

.header-nav-link {
  position: relative;
  padding-bottom: var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.header-nav-link:hover {
  color: var(--color-text);
}

.header-nav-link-active {
  color: var(--color-purple);
}

.header-nav-link-active::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: -2px;
  left: 0;
  height: 2px;
  border-radius: var(--radius-pill);
  background: var(--color-purple);
}

.site-header-tools {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.mobile-menu-trigger {
  display: none;
}

@media (max-width: 860px) {
  .site-nav,
  .site-header-tools {
    display: none;
  }

  .mobile-menu-trigger {
    display: inline-flex;
  }
}

/* Şehir seçici / kullanıcı menüsü — açılır panelin konum çerçevesi */
.city-selector,
.user-menu {
  position: relative;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: var(--z-dropdown);

  display: flex;
  flex-direction: column;
  min-width: 180px;
  max-height: 320px;
  overflow-y: auto;
  padding: var(--space-2);

  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--color-background-soft);
}

.dropdown-item--danger {
  color: var(--color-error);
}

.city-selector-empty {
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.user-menu-guest {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* Mobil menü */
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);

  display: flex;
  justify-content: flex-end;

  background: var(--color-overlay-scrim);
}

.mobile-menu-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  width: min(320px, 84vw);
  height: 100%;
  padding: var(--space-6) var(--space-5);

  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

.mobile-menu-link {
  padding: var(--space-3) var(--space-2);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  text-align: left;
  background: none;
  border: 0;
  cursor: pointer;
}

.mobile-menu-link:hover {
  background: var(--color-background-soft);
}

.mobile-menu-link-active {
  color: var(--color-purple);
  background: var(--color-background-soft);
}

.mobile-menu-logout {
  color: var(--color-error);
}

.mobile-menu-divider {
  height: 1px;
  margin: var(--space-3) 0;
  background: var(--color-border);
}
```

- [ ] **Step 5: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/Header.test.jsx`
Beklenen: PASS (10/10).

- [ ] **Step 6: Tüm test paketini, lint'i ve build'i çalıştır**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/layout/Header.jsx frontend/src/components/layout/Header.css \
        frontend/src/components/layout/Header.test.jsx
git commit -m "feat(frontend): Header bileşenini ekle"
```

---

### Task 8: `Footer.jsx` + `Footer.css`

Koyu zemin, 4 sütun + alt bar. Sahte sosyal medya ikonları veya icat edilmiş ödeme rozetleri **eklenmiyor** — gerçek hesap/entegrasyon yokken bunlar sahte içerik olurdu.

**Files:**
- Create: `frontend/src/components/layout/Footer.jsx`
- Create: `frontend/src/components/layout/Footer.css`
- Test: `frontend/src/components/layout/Footer.test.jsx`
- Modify: `frontend/src/styles/tokens.css`
- Modify: `frontend/src/styles/tokens.test.js`

**Interfaces:**
- Consumes: yeni `--color-footer-*` token'ları (bu görevde eklenir, temadan bağımsız — `--color-header-*`/`--color-overlay-scrim` ile aynı desen).
- Produces: `<Footer />` — Task 9 (Layout) render eder.

- [ ] **Step 1: `tokens.test.js`'e yeni testi ekle (FAIL beklenir)**

`frontend/src/styles/tokens.test.js` — mevcut son `it()` bloğundan sonra, `describe` kapanışından önce ekle:

```js
  it("footer token'larını temadan bağımsız tanımlar", () => {
    expect(css).toContain("--color-footer-background: #231C30;");
    expect(css).toContain("--color-footer-text: #EDE7F3;");
    expect(css).toContain("--color-footer-text-muted: #A99BBB;");
    expect(css).toContain("--color-footer-heading: #FFFFFF;");
    expect(css).toContain("--color-footer-border: rgba(255, 255, 255, 0.11);");
  });
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/tokens.test.js`
Beklenen: FAIL.

- [ ] **Step 3: `tokens.css`'e footer token'larını ekle**

`frontend/src/styles/tokens.css` — `:root` bloğu içinde, `--color-header-hover-surface: rgba(255, 255, 255, 0.12);` satırından hemen sonra ekle:

```css

  /* Footer (temadan bağımsız, her zaman koyu — "marka çıpası" artık footer'da, spec §6) */
  --color-footer-background: #231C30;
  --color-footer-text: #EDE7F3;
  --color-footer-text-muted: #A99BBB;
  --color-footer-heading: #FFFFFF;
  --color-footer-border: rgba(255, 255, 255, 0.11);
```

- [ ] **Step 4: Token testinin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/tokens.test.js`
Beklenen: PASS.

- [ ] **Step 5: `Footer.test.jsx`'i yaz (FAIL beklenir)**

`frontend/src/components/layout/Footer.test.jsx`:

```jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Footer from "./Footer.jsx";

function renderFooter() {
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe("Footer", () => {
  it("marka adını ve tanıtım metnini gösterir", () => {
    renderFooter();

    expect(screen.getByText("CineSeat")).toBeInTheDocument();
    expect(
      screen.getByText(/koltuğunu önceden seç/)
    ).toBeInTheDocument();
  });

  it("Keşfet sütununda mevcut rotalara bağlantı verir", () => {
    renderFooter();

    expect(
      screen.getByRole("link", { name: "Sinemalar" })
    ).toHaveAttribute("href", "/cinemas");
  });

  it("Kurumsal ve Yasal sütunlarını başlıklarıyla gösterir", () => {
    renderFooter();

    expect(screen.getByText("Kurumsal")).toBeInTheDocument();
    expect(screen.getByText("Yasal")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Gizlilik Politikası" })
    ).toHaveAttribute("href", "/privacy");
  });

  it("geçerli yılla telif satırını gösterir", () => {
    renderFooter();

    const currentYear = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} CineSeat`))
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/Footer.test.jsx`
Beklenen: FAIL — dosya yok.

- [ ] **Step 7: `Footer.jsx`'i oluştur**

`frontend/src/components/layout/Footer.jsx`:

```jsx
import { Link } from "react-router-dom";

import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-cols">
          <div className="site-footer-brand">
            <p className="site-footer-logo">CineSeat</p>
            <p className="site-footer-about">
              Türkiye&apos;nin dört bir yanındaki sinemalardan bilet al,
              koltuğunu önceden seç, kuyrukta bekleme.
            </p>
          </div>

          <div className="site-footer-col">
            <h2 className="site-footer-heading">Keşfet</h2>
            <ul className="site-footer-list">
              <li>
                <Link to="/">Vizyondaki Filmler</Link>
              </li>
              <li>
                <Link to="/cinemas">Sinemalar</Link>
              </li>
              <li>
                <Link to="/campaigns">Kampanyalar</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h2 className="site-footer-heading">Kurumsal</h2>
            <ul className="site-footer-list">
              <li>
                <Link to="/about">Hakkımızda</Link>
              </li>
              <li>
                <Link to="/contact">İletişim</Link>
              </li>
              <li>
                <Link to="/faq">Sıkça Sorulan Sorular</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer-col">
            <h2 className="site-footer-heading">Yasal</h2>
            <ul className="site-footer-list">
              <li>
                <Link to="/privacy">Gizlilik Politikası</Link>
              </li>
              <li>
                <Link to="/terms">Kullanım Koşulları</Link>
              </li>
              <li>
                <Link to="/kvkk">KVKK Aydınlatma Metni</Link>
              </li>
              <li>
                <Link to="/refund">İptal ve İade</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bar">
          <span>© {currentYear} CineSeat. Tüm hakları saklıdır.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
```

- [ ] **Step 8: `Footer.css`'i oluştur**

`frontend/src/components/layout/Footer.css`:

```css
.site-footer {
  margin-top: var(--space-16);
  background: var(--color-footer-background);
  color: var(--color-footer-text);
}

.site-footer-inner {
  max-width: var(--container-xl);
  margin-inline: auto;
  padding: var(--space-10) var(--space-5) var(--space-6);
}

.site-footer-cols {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: var(--space-8);
}

@media (max-width: 780px) {
  .site-footer-cols {
    grid-template-columns: 1fr 1fr;
  }
}

.site-footer-logo {
  margin: 0 0 var(--space-2);
  color: var(--color-footer-heading);
  font-size: var(--text-lg);
  font-weight: var(--weight-black);
  letter-spacing: -0.03em;
}

.site-footer-about {
  margin: 0;
  color: var(--color-footer-text-muted);
  font-size: var(--text-sm);
  line-height: 1.65;
}

.site-footer-heading {
  margin: 0 0 var(--space-3);
  color: var(--color-footer-heading);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.site-footer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.site-footer-list a {
  color: var(--color-footer-text-muted);
  font-size: var(--text-sm);
}

.site-footer-list a:hover {
  color: var(--color-footer-heading);
}

.site-footer-bar {
  margin-top: var(--space-8);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-footer-border);
  color: var(--color-footer-text-muted);
  font-size: var(--text-xs);
}
```

- [ ] **Step 9: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/Footer.test.jsx`
Beklenen: PASS (4/4).

- [ ] **Step 10: Tüm test paketini, lint'i ve build'i çalıştır**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`

- [ ] **Step 11: Commit**

```bash
git add frontend/src/styles/tokens.css frontend/src/styles/tokens.test.js \
        frontend/src/components/layout/Footer.jsx frontend/src/components/layout/Footer.css \
        frontend/src/components/layout/Footer.test.jsx
git commit -m "feat(frontend): Footer bileşenini ekle"
```

---

### Task 9: `Layout.jsx` yeniden yazımı — Faz 1 kapanışı

Eski tek-dosyalık `Layout.jsx` küçülüyor: skip-link + `<Header>` + `<Outlet>` + `<Footer>`. Bu, Faz 1'in son görevi — kapanışta tam kapı kontrolü var.

**Files:**
- Modify: `frontend/src/components/layout/Layout.jsx`
- Modify: `frontend/src/components/layout/Layout.test.jsx`
- Modify: `frontend/src/styles/base.css`
- Modify: `frontend/src/styles/base.test.js`

**Interfaces:**
- Consumes: `Header` (Task 7), `Footer` (Task 8), `useTheme()` (mevcut).
- Produces: `<Layout />` — `App.jsx`'in kök `<Route element={<Layout />}>`'u değişmeden bunu tüketmeye devam eder (App.jsx bu görevde değişmiyor).

- [ ] **Step 1: `base.test.js`'e yeni testleri ekle (FAIL beklenir)**

`frontend/src/styles/base.test.js` — mevcut son `it()` bloğundan sonra, `describe` kapanışından önce ekle:

```js
  it(".app-shell'i tam yükseklikte dikey bir kutu olarak tanımlar", () => {
    expect(css).toContain(".app-shell {");
    expect(css).toContain("display: flex;");
    expect(css).toContain("flex-direction: column;");
  });

  it(".skip-link'i odaklanınca görünür yapar", () => {
    expect(css).toContain(".skip-link {");
    expect(css).toContain(".skip-link:focus {");
    expect(css).toContain("color: var(--color-on-primary);");
  });
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/base.test.js`
Beklenen: FAIL.

- [ ] **Step 3: `base.css`'e `.app-shell` ve `.skip-link`'i ekle**

`frontend/src/styles/base.css` — dosyanın sonuna (`:focus-visible { ... }` bloğundan sonra) ekle:

```css

.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-shell > main {
  flex: 1;
}

.skip-link {
  position: absolute;
  top: -48px;
  left: var(--space-4);
  z-index: var(--z-toast);

  padding: var(--space-3) var(--space-5);

  background: var(--color-purple);
  color: var(--color-on-primary);
  border-radius: var(--radius-md);

  font-size: var(--text-sm);
  font-weight: var(--weight-bold);

  transition: top var(--duration-fast) var(--ease-out);
}

.skip-link:focus {
  top: var(--space-4);
}
```

- [ ] **Step 4: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/base.test.js`
Beklenen: PASS.

- [ ] **Step 5: `Layout.jsx`'i yeniden yaz**

`frontend/src/components/layout/Layout.jsx` — tüm dosyayı şununla değiştir:

```jsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import useTheme from "../../hooks/useTheme.js";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

function Layout() {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        İçeriğe geç
      </a>

      <Header />

      <main id="main-content" className="container">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
```

- [ ] **Step 6: `Layout.test.jsx`'i yeniden yaz**

`frontend/src/components/layout/Layout.test.jsx` — tüm dosyayı şununla değiştir (nav/Yönetim/aktif-sayfa testleri artık `Header.test.jsx`'te; burada yalnızca Layout'un kendi sorumluluğu kalıyor):

```jsx
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
```

- [ ] **Step 7: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/Layout.test.jsx`
Beklenen: PASS (2/2).

- [ ] **Step 8: Faz 1 kapanış kontrolü — tam paket**

Çalıştır: `cd frontend && npm run lint && npm run test:run && npm run build`
Beklenen: tüm testler PASS, lint 0 hata/uyarı, build başarılı. Bu geçmeden Faz 2'ye başlanmaz.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/layout/Layout.jsx frontend/src/components/layout/Layout.test.jsx \
        frontend/src/styles/base.css frontend/src/styles/base.test.js
git commit -m "feat(frontend): Layout'u Header/Footer kabuğuyla yeniden kur"
```

---

## Faz 1 Tamamlandığında

- Header açık yüzey, footer koyu zemin — spec §6'nın bilinçli tersine çevirmesi tamamlanmış olur.
- `Layout.jsx` 129 satırlık tek dosyadan, sekiz odaklı bileşene ve paylaşılan bir hook'a bölünmüş olur.
- `App.css`'teki ~150 satırlık ölü header/nav kodu temizlenmiş olur.
- Header/Footer'daki `/campaigns`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/kvkk`, `/refund` bağlantıları, ilgili sayfalar henüz yokken `NotFoundPage`'e düşer — bu, Faz 2/4 geldikçe kendiliğinden çözülür.
- Sıradaki plan: **Faz 2 — Landing + `/movies` ayrımı + Rail bileşeni** (spec §7, §10).
