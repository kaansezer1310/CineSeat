# Frontend Faz 0 — Token Temeli Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CineSeat frontend'ine, hiçbir sayfanın JSX yapısını değiştirmeden, light-first bir tasarım token katmanı (renk/spacing/tipografi/radius/gölge/motion/z-index) ve yeni font ailesini (Plus Jakarta Sans) kazandırmak; tema varsayılanını dark'tan light'a çevirmek ve tema attribute'unu `body`'den `html`'e taşımak.

**Architecture:** `frontend/src/styles/` altında dört yeni CSS dosyası (`tokens.css`, `base.css`, `primitives.css`, `utilities.css`) — `frontend/src/index.css` bunları sırayla `@import` eder. Mevcut CSS custom property adları (`--color-*`) **korunur**, yalnızca `:root` (artık light varsayılan) ve `[data-theme="dark"]` altındaki değerleri değişir; böylece 4488 satırlık mevcut `App.css`/`admin.css` hiç dokunulmadan yeni paleti otomatik alır. Yeni primitif class'lar (`.btn`, `.card`, `.input`, `.badge`, `.chip`, `.skeleton`) bu fazda tanımlanır ama henüz hiçbir JSX'e bağlanmaz — Faz 1+'ın tüketeceği bir sözleşmedir.

**Tech Stack:** React 19, Vite 8, Vitest 4 + Testing Library (jsdom), düz CSS (framework yok).

**Spec:** [`docs/superpowers/specs/2026-08-27-frontend-ui-revizyonu-design.md`](../specs/2026-08-27-frontend-ui-revizyonu-design.md) — bu plan spec'in §4 (Token katmanı mimarisi) ve §10 Faz 0 satırını uygular.

## Global Constraints

- Stil teknolojisi düz CSS'tir; Tailwind veya başka bir CSS framework'ü eklenmez (spec §2).
- `:root` artık **light** varsayılan; dark tema yalnızca `[data-theme="dark"]` altında token'ları yeniden tanımlar, hiçbir bileşen CSS'i temaya göre dallanmaz (spec §4).
- Tema attribute'u `document.body` değil **`document.documentElement`** (`<html>`) üzerine yazılır (spec §4).
- Mevcut `--color-*` custom property **adları** değiştirilmez/yeniden adlandırılmaz — yalnızca değerleri güncellenir. Bu, `App.css`/`admin.css`/`cinemas.css`'in hiç değiştirilmeden çalışmaya devam etmesinin garantisidir.
- Font: `"Plus Jakarta Sans"` (Google Fonts, ağırlıklar 400/500/600/700/800), `"Segoe UI", Arial, sans-serif` fallback zinciriyle.
- Renk paleti "Gece Yarısı Moru" (spec §3.1): birincil `#5B3E8E`, vurgu `#E0A82E`, zemin `#FAF8FC`, yüzey `#FFFFFF`, metin `#1E1A26`.
- Header ve poster-overlay token'ları (`--color-header-*`, `--color-overlay-scrim`, `--color-on-overlay`) bu fazda **değişmez** — Faz 1'de Header/Footer yeniden kurulana kadar orijinal (temadan bağımsız koyu) değerleriyle donuk kalır.
- Her görevin sonunda `npm run test:run` **ve** `npm run lint` yeşil olmalı; Faz 0'ın son görevinden sonra ayrıca `npm run build` de yeşil olmalı. Bu fazda davranış/JSX değişikliği yoktur — mevcut 188 test hiç dokunulmadan geçmelidir.

---

## File Structure

```
frontend/
  index.html                              [MODIFY] FOUC script <head>'e taşınır, light varsayılan, font linki değişir
  index.html.test.js                      [CREATE] index.html içerik sözleşmesi testi
  src/
    styles/
      tokens.css                          [CREATE] tüm tasarım token'ları
      tokens.test.js                      [CREATE]
      base.css                            [CREATE] reset + tipografi varsayılanları + :focus-visible
      base.test.js                        [CREATE]
      primitives.css                      [CREATE] .btn/.card/.input/.badge/.chip/.skeleton
      primitives.test.js                  [CREATE]
      utilities.css                       [CREATE] .container/.stack/.rail/.visually-hidden
      utilities.test.js                   [CREATE]
    index.css                             [MODIFY] içerik tamamen @import'lara döner
    context/
      ThemeProvider.jsx                   [MODIFY] varsayılan "dark" → "light"
      ThemeProvider.test.jsx              [CREATE]
    components/layout/
      Layout.jsx                          [MODIFY] satır 24: document.body → document.documentElement
      Layout.test.jsx                     [MODIFY] yeni test: tema <html>'e uygulanıyor
```

---

### Task 1: Tasarım token'ları (`tokens.css`)

**Files:**
- Create: `frontend/src/styles/tokens.css`
- Test: `frontend/src/styles/tokens.test.js`

**Interfaces:**
- Consumes: yok (ilk görev).
- Produces: `--color-*` (mevcut adlarla, yeni light/dark değerleriyle), `--color-ambient-glow`, `--color-success-bg`, `--space-1..16`, `--text-xs..5xl`, `--weight-regular..black`, `--radius-sm..pill`, `--shadow-sm..lg`, `--duration-fast..slow`, `--ease-out`, `--ease-in-out`, `--z-header..toast`, `--container-sm..xl`, `--font-ui`. Bunlar Task 2, Task 3 ve tüm sonraki fazlar tarafından tüketilir.

- [ ] **Step 1: Testi yaz (henüz dosya yok, FAIL beklenir)**

`frontend/src/styles/tokens.test.js`:

```js
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf-8");

describe("tokens.css", () => {
  it(":root paletini light (varsayılan) olarak tanımlar", () => {
    expect(css).toContain("color-scheme: light;");
    expect(css).toContain("--color-background: #FAF8FC;");
    expect(css).toContain("--color-surface: #FFFFFF;");
    expect(css).toContain("--color-purple: #5B3E8E;");
    expect(css).toContain("--color-yellow: #E0A82E;");
    expect(css).toContain("--color-text: #1E1A26;");
  });

  it('[data-theme="dark"] altında orijinal dark palet değerlerini korur', () => {
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain("color-scheme: dark;");
    expect(css).toContain("--color-background: #0c0912;");
    expect(css).toContain("--color-surface: #1b1425;");
    expect(css).toContain("--color-purple: #8765a3;");
    expect(css).toContain("--color-focus-ring: var(--color-yellow);");
  });

  it("spacing, radius, gölge, motion, z-index ve container ölçeklerini tanımlar", () => {
    expect(css).toContain("--space-4: 16px;");
    expect(css).toContain("--radius-lg: 14px;");
    expect(css).toContain(
      "--shadow-md: 0 10px 30px var(--color-shadow), 0 2px 6px var(--color-shadow);"
    );
    expect(css).toContain("--duration-base: 180ms;");
    expect(css).toContain("--z-modal: 400;");
    expect(css).toContain("--container-lg: 1200px;");
  });

  it("gövde fontunu Plus Jakarta Sans olarak tanımlar", () => {
    expect(css).toContain(
      '--font-ui: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif;'
    );
  });

  it("header ve overlay token'larını temadan bağımsız, orijinal değerleriyle korur", () => {
    expect(css).toContain("--color-header-background: rgba(12, 9, 18, 0.9);");
    expect(css).toContain("--color-overlay-scrim: rgba(12, 9, 18, 0.82);");
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/tokens.test.js`
Beklenen: FAIL — `tokens.css` dosyası yok (`ENOENT`).

- [ ] **Step 3: `tokens.css`'i oluştur**

`frontend/src/styles/tokens.css`:

```css
/* ═══════════════════════════════════════════════════════
   Tasarım token katmanı — tek kaynak.

   :root                     → light tema (varsayılan)
   [data-theme="dark"]       → dark tema (Faz 6'da yeniden ele alınacak;
                                şimdilik önceki dark palet değerleri)

   Header ve poster-katmanı token'ları kasıtlı olarak temadan bağımsızdır
   (Faz 1'de Header/Footer yeniden kurulana kadar sabit kalır).
   ═══════════════════════════════════════════════════════ */
:root {
  color-scheme: light;

  /* Yüzeyler */
  --color-background: #FAF8FC;
  --color-background-soft: #F2EFF7;
  --color-surface: #FFFFFF;
  --color-surface-light: #F6F2FA;
  --color-ambient-glow: rgba(91, 62, 142, 0.10);

  /* Marka */
  --color-purple: #5B3E8E;
  --color-purple-light: #7B5CAE;
  --color-yellow: #E0A82E;
  --color-yellow-hover: #C6921F;
  --color-yellow-text: #7A5A0E;
  --color-on-accent: #2B2100;

  /* Metin */
  --color-text: #1E1A26;
  --color-text-muted: #6B6478;

  /* Kenarlık */
  --color-border: #E4DFEC;
  --color-border-strong: #C9BEDB;

  /* Durum renkleri */
  --color-success: #2E7D5B;
  --color-success-bg: #E2F1EA;
  --color-error: #C0392B;
  --color-error-text: #A93226;
  --color-error-bg: #FBE7E4;
  --color-error-border: rgba(192, 57, 43, 0.3);

  /* Pasif (disabled) alan/aksiyonlar */
  --color-disabled-bg: #E7E2ED;
  --color-disabled-text: #948C9E;

  /* Dolu koltuk durumu */
  --color-seat-occupied-bg: #D5D0DC;
  --color-seat-occupied-text: #5F5869;

  /* Odak halkası */
  --color-focus-ring: var(--color-purple);

  /* Gölgeler (ham renk — --shadow-* ölçeği bunları kullanır) */
  --color-shadow: rgba(76, 52, 112, 0.14);
  --color-shadow-strong: rgba(76, 52, 112, 0.22);

  /* Poster üzeri katman (her iki temada koyu kalır) */
  --color-overlay-scrim: rgba(12, 9, 18, 0.82);
  --color-on-overlay: #f2edf5;

  /* Header (Faz 1'e kadar temadan bağımsız, orijinal değerler) */
  --color-header-background: rgba(12, 9, 18, 0.9);
  --color-header-border: rgba(190, 164, 207, 0.14);
  --color-header-text: #f2edf5;
  --color-header-text-muted: #c3b8d0;
  --color-header-accent: #d8b662;
  --color-header-hover-surface: rgba(255, 255, 255, 0.12);

  --font-ui: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif;

  /* Boşluk ölçeği (4px taban) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Tipografi ölçeği */
  --text-xs: 0.75rem;
  --text-sm: 0.8125rem;
  --text-base: 1rem;
  --text-md: 1.125rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
  --text-2xl: 1.875rem;
  --text-3xl: clamp(1.75rem, 1.4rem + 1.5vw, 2.375rem);
  --text-4xl: clamp(2rem, 1.5rem + 2.2vw, 2.75rem);
  --text-5xl: clamp(2.25rem, 1.5rem + 3.2vw, 3.5rem);

  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-black: 800;

  /* Radius ölçeği */
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  /* Gölge ölçeği (katmanlı — Yumuşak Modern dilinin imzası) */
  --shadow-sm: 0 2px 6px var(--color-shadow);
  --shadow-md: 0 10px 30px var(--color-shadow), 0 2px 6px var(--color-shadow);
  --shadow-lg: 0 20px 48px var(--color-shadow-strong), 0 4px 12px var(--color-shadow);

  /* Motion */
  --duration-fast: 120ms;
  --duration-base: 180ms;
  --duration-slow: 280ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

  /* Z-index ölçeği */
  --z-header: 100;
  --z-dropdown: 200;
  --z-overlay: 300;
  --z-modal: 400;
  --z-toast: 500;

  /* Container genişlikleri */
  --container-sm: 640px;
  --container-md: 960px;
  --container-lg: 1200px;
  --container-xl: 1440px;
}

[data-theme="dark"] {
  color-scheme: dark;

  --color-background: #0c0912;
  --color-background-soft: #14101c;
  --color-surface: #1b1425;
  --color-surface-light: #241a30;
  --color-ambient-glow: rgba(92, 62, 122, 0.24);

  --color-purple: #8765a3;
  --color-purple-light: #a181ba;
  --color-yellow: #d0ac59;
  --color-yellow-hover: #ddbd70;
  --color-yellow-text: #d0ac59;
  --color-on-accent: #211a0b;

  --color-text: #f2edf5;
  --color-text-muted: #aaa0b4;

  --color-border: rgba(190, 164, 207, 0.14);
  --color-border-strong: rgba(190, 164, 207, 0.25);

  --color-success: #71947c;
  --color-success-bg: rgba(113, 148, 124, 0.16);
  --color-error: #d77b82;
  --color-error-text: #e8a0a0;
  --color-error-bg: rgba(220, 80, 80, 0.1);
  --color-error-border: rgba(220, 80, 80, 0.35);

  --color-disabled-bg: #4a414f;
  --color-disabled-text: #89808d;

  --color-seat-occupied-bg: #3e3843;
  --color-seat-occupied-text: #cfc9d3;

  --color-focus-ring: var(--color-yellow);

  --color-shadow: rgba(0, 0, 0, 0.22);
  --color-shadow-strong: rgba(0, 0, 0, 0.28);
}
```

- [ ] **Step 4: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/tokens.test.js`
Beklenen: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/tokens.css frontend/src/styles/tokens.test.js
git commit -m "feat(frontend): light-first tasarım token katmanını ekle"
```

---

### Task 2: Reset + tipografi + yardımcı sınıflar (`base.css`, `utilities.css`) ve `index.css`'in yeniden bağlanması

Bu görev, `index.css`'in mevcut inline içeriğini tamamen `@import`'lara çevirdiği için **tek commit'te atomik olmalı**: `.visually-hidden` şu an `BookingPage.jsx` ve `CartPage.jsx` tarafından kullanılıyor — `base.css` ile aynı commit'te `utilities.css` de gelmezse, bu iki sayfanın testleri arada kırılır.

**Files:**
- Create: `frontend/src/styles/base.css`
- Create: `frontend/src/styles/base.test.js`
- Create: `frontend/src/styles/utilities.css`
- Create: `frontend/src/styles/utilities.test.js`
- Modify: `frontend/src/index.css` (tüm dosya — aşağıdaki final içerikle değiştirilir)

**Interfaces:**
- Consumes: Task 1'in `--color-*`, `--font-ui`, `--text-base`, `--weight-regular`, `--radius-sm` token'ları.
- Produces: global reset + `:focus-visible` + `.container(--sm/md/xl)`, `.stack`, `.rail`, `.visually-hidden` class'ları. `.visually-hidden` Faz 0'dan sonra da `BookingPage`/`CartPage` tarafından tüketilmeye devam eder.

- [ ] **Step 1: `base.css` ve `utilities.css` testlerini yaz (FAIL beklenir)**

`frontend/src/styles/base.test.js`:

```js
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./base.css", import.meta.url), "utf-8");

describe("base.css", () => {
  it("kutu modelini sıfırlar", () => {
    expect(css).toContain("box-sizing: border-box;");
  });

  it("body'de tema token'larını ve ambient glow'u kullanır", () => {
    expect(css).toContain("var(--color-ambient-glow) 0%");
    expect(css).toContain("color: var(--color-text);");
    expect(css).toContain("font-family: var(--font-ui);");
    expect(css).toContain("font-size: var(--text-base);");
  });

  it("global :focus-visible halkası tanımlar", () => {
    expect(css).toContain(":focus-visible {");
    expect(css).toContain("outline: 2px solid var(--color-focus-ring);");
  });

  it("linklerin ve butonların varsayılan tarayıcı stilini sıfırlar", () => {
    expect(css).toContain("text-decoration: none;");
    expect(css).toContain("border: 0;");
  });
});
```

`frontend/src/styles/utilities.test.js`:

```js
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./utilities.css", import.meta.url), "utf-8");

describe("utilities.css", () => {
  it(".container sayfa genişliğini token'dan alır", () => {
    expect(css).toContain("max-width: var(--container-lg);");
    expect(css).toContain(".container--xl { max-width: var(--container-xl); }");
  });

  it(".rail yatay kaydırmalı şerit tanımlar", () => {
    expect(css).toContain("overflow-x: auto;");
    expect(css).toContain("scroll-snap-type: x proximity;");
  });

  it(".visually-hidden erişilebilirlik yardımcı sınıfını korur", () => {
    expect(css).toContain(".visually-hidden {");
    expect(css).toContain("clip-path: inset(50%);");
  });
});
```

- [ ] **Step 2: Testlerin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/base.test.js src/styles/utilities.test.js`
Beklenen: FAIL — dosyalar yok.

- [ ] **Step 3: `base.css`'i oluştur**

`frontend/src/styles/base.css`:

```css
/* Sıfırlama, tipografi varsayılanları ve global odak stili.
   Renk/ölçü değerleri tokens.css'ten gelir; burada ham değer yazılmaz. */

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;

  background:
    radial-gradient(
      circle at top,
      var(--color-ambient-glow) 0%,
      transparent 42%
    ),
    var(--color-background);

  color: var(--color-text);

  font-family: var(--font-ui);
  font-weight: var(--weight-regular);
  font-size: var(--text-base);
  line-height: 1.55;
}

button,
input,
select,
textarea {
  font: inherit;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  border: 0;
  background: none;
}

#root {
  min-height: 100vh;
}

:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 4: `utilities.css`'i oluştur**

`frontend/src/styles/utilities.css`:

```css
.container {
  width: 100%;
  max-width: var(--container-lg);
  margin-inline: auto;
  padding-inline: var(--space-5);
}

.container--sm { max-width: var(--container-sm); }
.container--md { max-width: var(--container-md); }
.container--xl { max-width: var(--container-xl); }

.stack {
  display: flex;
  flex-direction: column;
}

.stack > * + * {
  margin-top: var(--stack-gap, var(--space-4));
}

.rail {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  scroll-snap-type: x proximity;
  padding-bottom: var(--space-2);
}

.rail > * {
  scroll-snap-align: start;
  flex-shrink: 0;
}

.rail::-webkit-scrollbar {
  height: 8px;
}

.rail::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: var(--radius-pill);
}

.visually-hidden {
  position: absolute;

  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;

  border: 0;

  white-space: nowrap;

  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
}
```

- [ ] **Step 5: `index.css`'i tamamen yeniden yaz**

`frontend/src/index.css` — dosyanın **tüm içeriğini** aşağıdakiyle değiştir:

```css
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/utilities.css";
```

- [ ] **Step 6: Testlerin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/base.test.js src/styles/utilities.test.js`
Beklenen: PASS (7/7).

- [ ] **Step 7: Tüm test paketini ve build'i çalıştır — bu görevin en kritik doğrulaması**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`
Beklenen: mevcut **188 testin tamamı** hâlâ PASS, lint 0 hata/uyarı, build başarılı. Özellikle `BookingPage.test.jsx` ve `CartPage.test.jsx`'in `.visually-hidden` kullanan senaryoları kontrol et — bunlar kırılırsa `utilities.css`'in `index.css`'e doğru bağlandığından emin ol.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/styles/base.css frontend/src/styles/base.test.js \
        frontend/src/styles/utilities.css frontend/src/styles/utilities.test.js \
        frontend/src/index.css
git commit -m "feat(frontend): base reset ve yardımcı sınıfları ekle, index.css'i token importlarına bağla"
```

---

### Task 3: Bileşen primitifleri (`primitives.css`)

Bu görev yalnızca **yeni ve şu an kullanılmayan** class'lar ekler; hiçbir mevcut JSX'e bağlanmaz (Faz 1+ tüketecek). Bu yüzden düşük riskli — mevcut testler bu görevden etkilenmez.

**Files:**
- Create: `frontend/src/styles/primitives.css`
- Create: `frontend/src/styles/primitives.test.js`
- Modify: `frontend/src/index.css`

**Interfaces:**
- Consumes: Task 1'in token'ları (`--color-purple`, `--radius-md`, `--shadow-sm/md`, `--space-*`, `--text-*`, `--weight-*`, `--duration-fast`, `--ease-out/in-out`).
- Produces: `.btn` (+ `--sm/--md/--lg`, `--primary/--secondary/--ghost/--danger`), `.card`, `.input`, `.badge` (+ `--accent/--neutral/--success/--danger`), `.chip` (+ `[aria-pressed="true"]`/`--active`), `.skeleton`. Bu class adları Faz 1'den itibaren component'lerde kullanılacak — isimler burada kilitlenir, sonraki fazlarda değiştirilmez.

- [ ] **Step 1: Testi yaz (FAIL beklenir)**

`frontend/src/styles/primitives.test.js`:

```js
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./primitives.css", import.meta.url), "utf-8");

describe("primitives.css", () => {
  it(".btn varyantlarını tanımlar", () => {
    expect(css).toContain(".btn {");
    expect(css).toContain(".btn--primary {");
    expect(css).toContain("background: var(--color-purple);");
    expect(css).toContain(".btn--secondary {");
    expect(css).toContain(".btn--ghost {");
    expect(css).toContain(".btn--danger {");
  });

  it(".card gölge ölçeğini kullanır", () => {
    expect(css).toContain(".card {");
    expect(css).toContain("box-shadow: var(--shadow-md);");
  });

  it(".input odak ve hata durumlarını tanımlar", () => {
    expect(css).toContain(".input:focus-visible {");
    expect(css).toContain('.input[aria-invalid="true"] {');
  });

  it(".badge ve .chip varyantlarını tanımlar", () => {
    expect(css).toContain(".badge--accent {");
    expect(css).toContain(".badge--success {");
    expect(css).toContain('.chip[aria-pressed="true"],');
  });

  it(".skeleton azaltılmış hareket tercihine uyar", () => {
    expect(css).toContain("@keyframes skeleton-shimmer {");
    expect(css).toContain("@media (prefers-reduced-motion: reduce) {");
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/primitives.test.js`
Beklenen: FAIL — dosya yok.

- [ ] **Step 3: `primitives.css`'i oluştur**

`frontend/src/styles/primitives.css`:

```css
/* Buton */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 0;
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-weight: var(--weight-bold);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled,
.btn[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.btn--sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
}

.btn--md {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-sm);
}

.btn--lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
  border-radius: var(--radius-lg);
}

.btn--primary {
  background: var(--color-purple);
  color: #fff;
  box-shadow: var(--shadow-sm);
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-purple-light);
  box-shadow: var(--shadow-md);
}

.btn--secondary {
  background: var(--color-background-soft);
  color: var(--color-purple);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--color-border);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
}

.btn--ghost:hover:not(:disabled) {
  color: var(--color-text);
  background: var(--color-background-soft);
}

.btn--danger {
  background: var(--color-error);
  color: #fff;
}

.btn--danger:hover:not(:disabled) {
  background: var(--color-error-text);
}

/* Kart */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

/* Input */
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
}

.input:hover {
  border-color: var(--color-border-strong);
}

.input:focus-visible {
  border-color: var(--color-purple);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input[aria-invalid="true"] {
  border-color: var(--color-error);
}

/* Rozet */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  line-height: 1;
}

.badge--accent {
  background: var(--color-yellow);
  color: var(--color-on-accent);
}

.badge--neutral {
  background: var(--color-background-soft);
  color: var(--color-text-muted);
}

.badge--success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.badge--danger {
  background: var(--color-error-bg);
  color: var(--color-error);
}

/* Chip (seans saati / filtre seçici) */
.chip {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.chip:hover {
  border-color: var(--color-border-strong);
}

.chip[aria-pressed="true"],
.chip--active {
  background: var(--color-purple);
  border-color: var(--color-purple);
  color: #fff;
}

/* Skeleton (yükleme placeholder'ı) */
.skeleton {
  position: relative;
  overflow: hidden;
  background: var(--color-background-soft);
  border-radius: var(--radius-md);
  color: transparent;
}

.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  animation: skeleton-shimmer 1.4s var(--ease-in-out) infinite;
}

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton::after {
    animation: none;
  }
}
```

- [ ] **Step 4: `index.css`'e import ekle**

`frontend/src/index.css` — final içerik:

```css
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/primitives.css";
@import "./styles/utilities.css";
```

- [ ] **Step 5: Testin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/styles/primitives.test.js`
Beklenen: PASS (5/5).

- [ ] **Step 6: Tüm test paketini ve build'i çalıştır**

Çalıştır: `cd frontend && npm run test:run && npm run lint && npm run build`
Beklenen: 188+ test PASS, lint temiz, build başarılı.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/styles/primitives.css frontend/src/styles/primitives.test.js frontend/src/index.css
git commit -m "feat(frontend): buton/kart/input/rozet/chip/skeleton primitiflerini ekle"
```

---

### Task 4: Light-first tema varsayılanı ve `<html>` hedefi

Üç dosya (FOUC script'i, `ThemeProvider`, `Layout`'un tema efekti) birlikte tek bir davranışı kurar: "sayfa ilk yüklendiğinde light temayla açılır, kullanıcı tercihi `localStorage`'da saklanır, hiçbir yerde `document.body` hedeflenmez." Bu üçü ayrı commit'lere bölünürse aradaki durum tutarsız olur (ör. sadece `ThemeProvider` değişirse FOUC script'i hâlâ `body`'yi karartır) — bu yüzden tek görevde birlikte yürütülür.

**Files:**
- Modify: `frontend/index.html`
- Create: `frontend/index.html.test.js`
- Modify: `frontend/src/context/ThemeProvider.jsx`
- Create: `frontend/src/context/ThemeProvider.test.jsx`
- Modify: `frontend/src/components/layout/Layout.jsx:24`
- Modify: `frontend/src/components/layout/Layout.test.jsx`

**Interfaces:**
- Consumes: `useTheme` hook'u (`frontend/src/hooks/useTheme.js`, değişmiyor), `ThemeContext` (değişmiyor).
- Produces: `theme` varsayılan değeri artık `"light"`; `document.documentElement.dataset.theme` her zaman güncel temayı taşır, `document.body.dataset.theme` hiçbir yerde set edilmez.

- [ ] **Step 1: `index.html` testini yaz (FAIL beklenir)**

`frontend/index.html.test.js`:

```js
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf-8");

describe("index.html — FOUC koruma script'i", () => {
  it("temayı <html> üzerine, light varsayılanıyla uygular", () => {
    expect(html).toContain("document.documentElement.dataset.theme");
    expect(html).toContain('stored === "dark" ? "dark" : "light"');
    expect(html).not.toContain("document.body.dataset.theme");
  });

  it("script <head> içinde, </head> kapanışından önce çalışır", () => {
    const scriptIndex = html.indexOf(
      "document.documentElement.dataset.theme"
    );
    const headCloseIndex = html.indexOf("</head>");
    const bodyOpenIndex = html.indexOf("<body>");

    expect(scriptIndex).toBeGreaterThan(-1);
    expect(scriptIndex).toBeLessThan(headCloseIndex);
    expect(scriptIndex).toBeLessThan(bodyOpenIndex);
  });
});
```

- [ ] **Step 2: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run index.html.test.js`
Beklenen: FAIL — script hâlâ `<body>` içinde ve `document.body` hedefliyor.

- [ ] **Step 3: `index.html`'i güncelle**

`frontend/index.html` — tüm dosyayı şununla değiştir:

```html
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <title>CineSeat</title>
    <script>
      // Tema flash'ını (FOUC) önlemek için, uygulama yüklenmeden
      // önce kayıtlı temayı <html>'e uygula. Kaynak: localStorage.
      // Varsayılan artık light (bkz. src/styles/tokens.css :root).
      (function () {
        try {
          var stored = localStorage.getItem("cineseat_theme");
          document.documentElement.dataset.theme =
            stored === "dark" ? "dark" : "light";
        } catch (e) {
          document.documentElement.dataset.theme = "light";
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: `index.html` testinin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run index.html.test.js`
Beklenen: PASS (2/2).

- [ ] **Step 5: `ThemeProvider.test.jsx`'i yaz (FAIL beklenir)**

`frontend/src/context/ThemeProvider.test.jsx`:

```jsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import ThemeProvider from "./ThemeProvider.jsx";
import useTheme from "../hooks/useTheme.js";

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        Temayı değiştir
      </button>
    </div>
  );
}

function renderProbe() {
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("localStorage boşken varsayılan olarak light temayı seçer", () => {
    renderProbe();

    expect(screen.getByTestId("theme-value")).toHaveTextContent("light");
  });

  it("localStorage'da dark kayıtlıysa dark temayı seçer", () => {
    localStorage.setItem("cineseat_theme", "dark");

    renderProbe();

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
  });

  it("toggleTheme temayı değiştirir ve localStorage'a yazar", () => {
    renderProbe();

    fireEvent.click(
      screen.getByRole("button", { name: "Temayı değiştir" })
    );

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
    expect(localStorage.getItem("cineseat_theme")).toBe("dark");
  });
});
```

- [ ] **Step 6: Testin FAIL ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/context/ThemeProvider.test.jsx`
Beklenen: FAIL — ilk test, çünkü `ThemeProvider` hâlâ `"dark"` varsayılan döndürüyor.

- [ ] **Step 7: `ThemeProvider.jsx`'i güncelle**

`frontend/src/context/ThemeProvider.jsx` — tüm dosyayı şununla değiştir:

```jsx
import { useState } from "react";
import ThemeContext from "./ThemeContext.js";

/**
 * Sprint 3 / 1.5.9 — Light / Dark mod (REQ-23)
 *
 * Varsayılan: light (Faz 0 — light-first tasarım revizyonu).
 * Tema bilgisi localStorage'da saklanır.
 * CSS: <html>'e `data-theme="light"` veya `data-theme="dark"` attr eklenir.
 */
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("cineseat_theme");
    return stored === "dark" ? "dark" : "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("cineseat_theme", next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
```

- [ ] **Step 8: `ThemeProvider` testlerinin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/context/ThemeProvider.test.jsx`
Beklenen: PASS (3/3).

- [ ] **Step 9: `Layout.jsx`'in tema efektini güncelle**

`frontend/src/components/layout/Layout.jsx:24` — şunu:

```jsx
    document.body.dataset.theme = theme;
```

şununla değiştir:

```jsx
    document.documentElement.dataset.theme = theme;
```

- [ ] **Step 10: `Layout.test.jsx`'e yeni bir test ekle**

`frontend/src/components/layout/Layout.test.jsx` — mevcut son `it` bloğundan (`"menüden /cinemas rotasına bağlantı verir"`) hemen sonra, `});` ile biten `describe` bloğunun kapanışından önce ekle:

```jsx
  it("aktif temayı body yerine <html> üzerine uygular", () => {
    renderLayout();

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.body.dataset.theme).toBeUndefined();
  });
```

- [ ] **Step 11: `Layout` testlerinin PASS ettiğini doğrula**

Çalıştır: `cd frontend && npx vitest run src/components/layout/Layout.test.jsx`
Beklenen: mevcut 6 test + yeni test = 7/7 PASS.

- [ ] **Step 12: Faz 0 kapanış kontrolü — tam paket**

Çalıştır: `cd frontend && npm run lint && npm run test:run && npm run build`
Beklenen: **tüm test dosyaları PASS** (188 mevcut + bu fazda eklenen ~17 yeni test), lint 0 hata/uyarı, build başarılı. Bu geçmeden Faz 1'e başlanmaz (spec §10).

- [ ] **Step 13: Commit**

```bash
git add frontend/index.html frontend/index.html.test.js \
        frontend/src/context/ThemeProvider.jsx frontend/src/context/ThemeProvider.test.jsx \
        frontend/src/components/layout/Layout.jsx frontend/src/components/layout/Layout.test.jsx
git commit -m "feat(frontend): light-first tema varsayılanı ve <html> hedefine geçiş"
```

---

## Faz 0 Tamamlandığında

- Tüm site (hiçbir JSX değişmeden) yeni "Gece Yarısı Moru" light paletini ve Plus Jakarta Sans fontunu otomatik olarak alır.
- Dark tema, orijinal değerleriyle `[data-theme="dark"]` altında çalışmaya devam eder (tema butonu hâlâ işlevsel — Faz 6'da görsel olarak cilalanacak).
- `.btn`, `.card`, `.input`, `.badge`, `.chip`, `.skeleton` primitifleri kullanıma hazır ama henüz hiçbir sayfada kullanılmıyor.
- Sıradaki plan: **Faz 1 — Header/Footer/MobileMenu/Layout kabuğu** (spec §6, §10). Bu görev, bu primitifleri ilk kez gerçek bir bileşende (Header) tüketecek.
