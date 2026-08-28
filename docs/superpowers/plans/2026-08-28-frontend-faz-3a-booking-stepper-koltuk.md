# Faz 3a — Stepper Primitifi + BookingPage Yeniden Tasarımı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Spec'in "en kritik ekran" dediği `BookingPage`'i (koltuk seçimi) yeni tasarım diline taşımak: 3 adımlı `Stepper` primitifi + koltuk haritasının üstündeki "PERDE" bandını kavisli bir sinema perdesi görünümüne kavuşturmak + masaüstünde yapışkan özet paneli / mobilde sabit alt panel (bottom sheet).

**Architecture:** Bu, "Faz 3" (bilet satın alma akışının tamamı: MovieDetailsPage → BookingPage → CartPage → PaymentPage → SuccessPage/PaymentErrorPage) için yazılan İLK plan — kapsam bilinçli olarak yalnızca `BookingPage`'e (+ yeni `Stepper` primitifine) daraltıldı. Neden: `BookingPage`'in `.ticket-type-list`/`.ticket-type-row`/`.ticket-type-select*` class'ları `CartPage` ile **paylaşılıyor** (App.css'te `.booking-ticket-types, .cart-ticket-types { ... }` birleşik seçicisiyle tanımlı) — bu paylaşılan class'lara dokunmadan `BookingPage`'i tek başına modernize etmek güvenli ve net bir sınır çiziyor; `CartPage`/`PaymentPage`/`SuccessPage` ayrı bir sonraki planda ele alınacak. `BookingPage.jsx`'in state/hook/handler mantığı (koltuk seçimi, bilet tipi, sepete ekleme) **hiç değişmiyor** — yalnızca JSX'e `Stepper` ekleniyor ve class isimleri güncelleniyor; bu görsel bir revizyon, davranış değişikliği yok.

**Tech Stack:** React 19, Vite, düz CSS (Faz 0'da kurulan token katmanı), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-27-frontend-ui-revizyonu-design.md` (§8 "BookingPage — en kritik ekran": 3 adımlı Stepper, koltuk haritası perde eğrisi, masaüstünde yapışkan özet / mobilde bottom sheet)

## Global Constraints

- `BookingPage.jsx`'in state, hook, handler, sorgu (`useQuery`) mantığı **değişmiyor** — yalnızca JSX'e `Stepper` eklenip class isimleri güncelleniyor.
- `App.css`'teki `.ticket-type-list`, `.ticket-type-row`, `.ticket-type-select-wrap`, `.ticket-type-select`, `.booking-ticket-types`/`.cart-ticket-types` birleşik seçicisi ve bunların altındaki tüm kurallar (mevcut dosyada `.booking-ticket-types,\n.cart-ticket-types {` satırından `.cart-ticket-types { margin-top: 16px; ... }` kuralının kapanışına kadarki blok) **`CartPage` ile paylaşılıyor — bu görevde DOKUNULMUYOR.**
- `.refresh-button` class'ı `MoviesPage.jsx` ile paylaşılıyor (Faz 2'de taşınan eski film listesi sayfası) — App.css'teki tanımına dokunulmuyor, `BookingPage.jsx`'teki "↻ Koltukları Yenile" butonunun class'ı da değişmiyor.
- Yeni class isimleri `tokens.css`/`primitives.css`'teki mevcut token'ları kullanır (ham renk/px değeri yazılmaz) — istisna: `.seat`'in `font-size: clamp(0.58rem, 1.2vw, var(--text-xs))` gibi zaten mevcut `clamp()` kalıpları, bunlar token'lı üst sınırla korunur.
- Her görev sonunda `npm run lint`, `npm run test:run` yeşil olmalı.

---

### Task 1: Stepper primitifi

**Files:**
- Create: `frontend/src/components/ui/Stepper.jsx`
- Create: `frontend/src/components/ui/Stepper.css`
- Test: `frontend/src/components/ui/Stepper.test.jsx`

**Interfaces:**
- Produces: `Stepper` bileşeni, default export. Props: `{ steps: string[], currentStepIndex: number }`. `currentStepIndex`'ten önceki adımlar "complete" (✓ işaretli), `currentStepIndex`'teki adım "current" (`aria-current="step"`), sonrakiler "upcoming" (sıra numarası) olarak render edilir. Route/form kontrolü YAPMAZ — salt görsel bir ilerleme göstergesi (bu akışta 3 adım 3 farklı sayfada gerçekleşiyor: Koltuk+Bilet Tipi `BookingPage`'te, Ödeme `PaymentPage`'te — Stepper her sayfada kendi `currentStepIndex`'iyle kullanılır).

- [ ] **Step 1: Stepper.jsx'i yaz**

```jsx
import "./Stepper.css";

function Stepper({ steps, currentStepIndex }) {
  return (
    <ol className="stepper" aria-label="Bilet alma adımları">
      {steps.map((label, index) => {
        const state =
          index < currentStepIndex
            ? "complete"
            : index === currentStepIndex
              ? "current"
              : "upcoming";

        return (
          <li
            key={label}
            className={`stepper-step stepper-step--${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="stepper-number" aria-hidden="true">
              {state === "complete" ? "✓" : index + 1}
            </span>
            <span className="stepper-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default Stepper;
```

- [ ] **Step 2: Stepper.css'i yaz**

```css
.stepper {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  margin: 0 0 var(--space-8);
  padding: 0;

  list-style: none;
}

.stepper-step {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stepper-step:not(:last-child)::after {
  content: "";
  display: inline-block;

  width: 32px;
  height: 2px;
  margin-inline: var(--space-2);

  background: var(--color-border);
}

.stepper-number {
  display: grid;
  place-items: center;

  width: 28px;
  height: 28px;

  border-radius: var(--radius-pill);

  background: var(--color-background-soft);
  color: var(--color-text-muted);

  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
}

.stepper-label {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.stepper-step--current .stepper-number {
  background: var(--color-purple);
  color: var(--color-on-primary);
}

.stepper-step--current .stepper-label {
  color: var(--color-text);
}

.stepper-step--complete .stepper-number {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.stepper-step--complete .stepper-label {
  color: var(--color-text);
}

@media (max-width: 480px) {
  .stepper-label {
    display: none;
  }
}
```

- [ ] **Step 3: Stepper.test.jsx'i yaz**

```jsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Stepper from "./Stepper.jsx";

const STEPS = ["Koltuk", "Bilet Tipi", "Ödeme"];

describe("Stepper", () => {
  it("tüm adımları sırayla gösterir", () => {
    render(<Stepper steps={STEPS} currentStepIndex={0} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "1Koltuk",
      "2Bilet Tipi",
      "3Ödeme",
    ]);
  });

  it("geçerli adımı aria-current ile işaretler", () => {
    render(<Stepper steps={STEPS} currentStepIndex={1} />);

    const current = screen.getByText("Bilet Tipi").closest("li");
    expect(current).toHaveAttribute("aria-current", "step");
  });

  it("tamamlanmış adımı onay işaretiyle gösterir", () => {
    render(<Stepper steps={STEPS} currentStepIndex={1} />);

    const completed = screen.getByText("Koltuk").closest("li");
    expect(completed.textContent).toBe("✓Koltuk");
  });

  it("henüz gelmemiş adımı sıra numarasıyla gösterir", () => {
    render(<Stepper steps={STEPS} currentStepIndex={0} />);

    const upcoming = screen.getByText("Ödeme").closest("li");
    expect(upcoming.textContent).toBe("3Ödeme");
  });

  it("ilk adım aktifken tamamlanmış adım göstermez", () => {
    render(<Stepper steps={STEPS} currentStepIndex={0} />);

    const first = screen.getByText("Koltuk").closest("li");
    expect(first.textContent).toBe("1Koltuk");
    expect(first).toHaveAttribute("aria-current", "step");
  });
});
```

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- Stepper.test.jsx` (frontend/ dizininde)
Expected: 5/5 PASS

- [ ] **Step 5: Lint ve commit**

```bash
npm run lint
git add frontend/src/components/ui/Stepper.jsx frontend/src/components/ui/Stepper.css frontend/src/components/ui/Stepper.test.jsx
git commit -m "feat(frontend): Stepper primitifini ekle"
```

---

### Task 2: BookingPage — Stepper entegrasyonu + koltuk haritası perde eğrisi + yapışkan özet/mobil alt panel

**Files:**
- Modify: `frontend/src/pages/BookingPage.jsx`
- Modify: `frontend/src/App.css` (iki ayrı, bitişik olmayan blok — aralarındaki paylaşılan bilet-tipi bloğuna dokunulmuyor, aşağıda net sınırlarla belirtiliyor)

**Interfaces:**
- Consumes: `Stepper` (`components/ui/Stepper.jsx`, Görev 1). `BookingPage.jsx`'te zaten hesaplanmış olan `hasSelectedSeats` (satır ~328, `selectedSeatCount > 0`) değişkeni `currentStepIndex` hesabında kullanılır — yeni bir state/hesap eklenmiyor.

**Karar (Stepper'ın adım mantığı):** Bu akışta "Koltuk", "Bilet Tipi" ve "Ödeme" üç ayrı SAYFA/rotadır (`BookingPage`, sonra `CartPage`, sonra `PaymentPage`) — tek bir çok adımlı form değil. `BookingPage`'te "Koltuk" ve "Bilet Tipi" AYNI ekranda (koltuk haritası + özet panelindeki bilet tipi seçiciler) ardışık gösteriliyor. Bu yüzden Stepper burada rota kontrolü yapmaz, yalnızca ilerlemeyi özetler: henüz koltuk seçilmemişse "Koltuk" adımı aktif (`currentStepIndex=0`); en az bir koltuk seçilmişse (bilet tipi seçiciler göründüğü an) "Bilet Tipi" adımı aktif (`currentStepIndex=1`) ve "Koltuk" tamamlanmış görünür. "Ödeme" adımı bu sayfada hiçbir zaman aktif olmaz (o `PaymentPage`'in kendi Stepper kullanımıdır — ayrı bir plan/görev, bu görevin kapsamı dışında).

- [ ] **Step 1: BookingPage.jsx'e Stepper'ı entegre et**

`frontend/src/pages/BookingPage.jsx` dosyasının en üstündeki importlara ekle (satır 9-10 civarı, `SeatMap` import'undan hemen sonra):

```jsx
import SeatMap from "../components/seats/SeatMap.jsx";
import Stepper from "../components/ui/Stepper.jsx";
import StatusPanel from "../components/ui/StatusPanel.jsx";
```

`availabilityMessage` bloğu ile `<div className="booking-layout">` arasına (yani şu anki):

```jsx
            {availabilityMessage && (
                <p
                    className="booking-availability-status"
                    role="status"
                >
                    {availabilityMessage}
                </p>
            )}

            <div className="booking-layout">
```

bloğunu şuna değiştir:

```jsx
            {availabilityMessage && (
                <p
                    className="booking-availability-status"
                    role="status"
                >
                    {availabilityMessage}
                </p>
            )}

            <Stepper
                steps={["Koltuk", "Bilet Tipi", "Ödeme"]}
                currentStepIndex={hasSelectedSeats ? 1 : 0}
            />

            <div className="booking-layout">
```

- [ ] **Step 2: Buton class'larını primitiflere geçir**

Aynı dosyada, "Sepete Ekle" butonu:

```jsx
                    <button
                        className="primary-button booking-action-button"
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!canAddToCart}
                    >
                        Sepete Ekle
                    </button>
```

şuna değiştir:

```jsx
                    <button
                        className="btn btn--primary btn--lg booking-action-button"
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!canAddToCart}
                    >
                        Sepete Ekle
                    </button>
```

"Seçimi Temizle" butonu:

```jsx
                        <button
                            className="clear-selection-button"
                            type="button"
                            onClick={handleClearSelection}
                        >
                            Seçimi Temizle
                        </button>
```

şuna değiştir:

```jsx
                        <button
                            className="btn btn--ghost btn--sm clear-selection-button"
                            type="button"
                            onClick={handleClearSelection}
                        >
                            Seçimi Temizle
                        </button>
```

"↻ Koltukları Yenile" butonunun class'ı (`refresh-button`) **değişmiyor** — bu class `MoviesPage.jsx` ile paylaşılıyor, dokunma.

- [ ] **Step 3: App.css'in birinci bloğunu değiştir (booking-heading → booking-summary-row)**

`frontend/src/App.css` içinde `.booking-heading {` ile başlayıp `.booking-summary-row strong { ... }` kuralının kapanışına kadar (yani `.booking-ticket-types,\n.cart-ticket-types {` satırından HEMEN ÖNCEKİ kısım) — bu bloğun TAMAMINI şununla değiştir:

```css
.booking-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);

  margin-bottom: var(--space-6);
}

.booking-heading h1 {
  margin: var(--space-2) 0 var(--space-3);

  color: var(--color-text);

  font-size: var(--text-4xl);
  font-weight: var(--weight-black);
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.back-link {
  display: inline-block;
  margin-bottom: var(--space-3);

  color: var(--color-text-muted);

  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);

  transition: color var(--duration-fast) var(--ease-out);
}

.back-link:hover {
  color: var(--color-purple);
}

.booking-meta {
  margin: 0;

  color: var(--color-text-muted);

  font-size: var(--text-md);
  font-weight: var(--weight-regular);
  line-height: 1.5;
}

.booking-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-6);
  align-items: start;
}

.booking-availability-status {
  margin: 0 0 var(--space-5);
  padding: var(--space-3) var(--space-4);

  border-radius: var(--radius-md);

  background: var(--color-background-soft);
  color: var(--color-text-muted);

  font-size: var(--text-sm);
}

.seat-map-section {
  min-width: 0;
  padding: clamp(var(--space-5), 3vw, var(--space-8));

  border-radius: var(--radius-xl);

  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

/* "Perde eğrisi" — sinema perdesini andıran kavisli bant. */
.cinema-screen {
  position: relative;

  width: 78%;
  height: 44px;
  margin: 0 auto var(--space-12);

  border-radius: 50% / 100% 100% 0 0;
  background: linear-gradient(
    180deg,
    var(--color-purple-light) 0%,
    transparent 100%
  );
  box-shadow: 0 18px 30px var(--color-shadow);
  opacity: 0.4;

  color: var(--color-text-muted);
  text-align: center;
}

.cinema-screen span {
  position: absolute;
  top: var(--space-2);
  left: 0;
  right: 0;

  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.1em;
}

.seat-map {
  /* --seat-columns SeatMap.jsx tarafindan veriye gore set edilir;
     sutun kurali burada, JSX'te degil. */
  --seat-columns: 8;

  display: grid;
  grid-template-columns: repeat(var(--seat-columns), minmax(0, 1fr));
  gap: var(--space-2);

  width: min(100%, 620px);
  margin: 0 auto;
}

/* Koltuklar kendi (satir, sutun) konumlarina yerlesir; boylece devre disi
   koltuklar planda bosluk birakir. Degerleri SeatMap veriden gecirir. */
.seat[style*="--seat-row"] {
  grid-row: var(--seat-row);
  grid-column: var(--seat-column);
}

.seat {
  display: grid;
  aspect-ratio: 1;
  place-items: center;

  min-width: 0;
  padding: 0;

  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);

  background: var(--color-surface-light);
  color: var(--color-text-muted);

  font-size: clamp(0.58rem, 1.2vw, var(--text-xs));
  font-weight: var(--weight-bold);

  cursor: pointer;

  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.seat:hover:not(:disabled) {
  border-color: var(--color-purple);
  color: var(--color-text);
  transform: translateY(-1px);
}

.seat:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.seat:disabled {
  cursor: not-allowed;
}

/* BOS — seçilebilir, boş koltuk (varsayılan `.seat` görünümü). */
.seat-status-bos {
  border-color: var(--color-border-strong);
  background: var(--color-surface-light);
  color: var(--color-text-muted);
}

/* SECILI — mevcut kullanıcı tarafından seçilmiş, henüz onaylanmamış. */
.seat-status-secili {
  border-color: var(--color-purple);
  background: var(--color-purple);
  color: var(--color-on-primary);
  font-weight: var(--weight-bold);
}

/* GECICI_KILITLI — REQ-19 sayacı işleyen geçici kilit; renk körlüğüne karşı
   rengin yanında çizgili desenle de ayrıştırılır. */
.seat-status-gecici-kilitli {
  border: 1px dashed var(--color-warn);
  background: repeating-linear-gradient(
    135deg,
    var(--color-accent-soft) 0 6px,
    transparent 6px 12px
  );
  color: var(--color-text);

  cursor: not-allowed;
  opacity: 0.85;
}

/* DOLU — ödemesi tamamlanmış, dolu koltuk. */
.seat-status-dolu {
  border-color: transparent;
  background: var(--color-seat-occupied-bg);
  color: var(--color-seat-occupied-text);

  cursor: not-allowed;
  opacity: 0.6;
}

.seat-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-5);

  margin-top: var(--space-6);

  color: var(--color-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.seat-legend div {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.legend-seat {
  display: inline-block;

  width: 15px;
  height: 15px;

  border-radius: var(--radius-sm);
}

.booking-summary {
  position: sticky;
  top: var(--space-16);

  padding: var(--space-6);

  border-radius: var(--radius-xl);

  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

.booking-summary h2 {
  margin: 0 0 var(--space-5);

  font-size: var(--text-xl);
  font-weight: var(--weight-black);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.booking-summary-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-5);

  padding: var(--space-3) 0;

  border-bottom: 1px solid var(--color-border);
}

.booking-summary-row span {
  color: var(--color-text-muted);
  font-weight: var(--weight-regular);
}

.booking-summary-row strong {
  max-width: 190px;

  color: var(--color-text);
  font-weight: var(--weight-semibold);
  text-align: right;
}
```

**Bu bloktan hemen sonra gelen `.booking-ticket-types,\n.cart-ticket-types { ... }` ile başlayan ve `.cart-ticket-types { margin-top: 16px; padding-top: 0; border-bottom: 0; }` kuralının kapanışına kadarki paylaşılan bilet-tipi bloğuna DOKUNMA — olduğu gibi bırak.**

- [ ] **Step 4: App.css'in ikinci bloğunu değiştir (booking-total → eski mobil medya sorguları)**

Paylaşılan bilet-tipi bloğundan hemen sonra gelen, `.booking-total {` ile başlayıp aşağıdaki iki eski medya sorgusunun (900px ve 650px) kapanışına kadarki bölümün TAMAMINI (yani `.booking-total`, `.booking-action-button`, `.booking-action-button:disabled`, `.clear-selection-button`, `.clear-selection-button:hover`, `@media (max-width: 900px) { .booking-layout, .booking-summary }`, `@media (max-width: 650px) { .booking-heading, .seat-map, .seat, .ticket-type-row, .ticket-type-select-wrap }`) şununla değiştir:

```css
.booking-total {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--space-5) 0 var(--space-4);
}

.booking-total span {
  color: var(--color-text-muted);
  font-weight: var(--weight-semibold);
}

.booking-total strong {
  color: var(--color-purple);

  font-size: var(--text-xl);
  font-weight: var(--weight-black);
}

.booking-action-button {
  width: 100%;
}

.clear-selection-button {
  width: 100%;
  margin-top: var(--space-3);
}

@media (max-width: 860px) {
  .booking-layout {
    grid-template-columns: 1fr;
    padding-bottom: 280px;
  }

  .booking-summary {
    position: fixed;
    inset: auto 0 0 0;
    top: auto;
    z-index: var(--z-modal);

    max-height: 70vh;
    overflow-y: auto;

    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    box-shadow: var(--shadow-lg);
  }
}

@media (max-width: 650px) {
  .booking-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .booking-heading .refresh-button {
    align-self: flex-start;
  }

  .seat-map {
    gap: var(--space-1);
  }

  .seat {
    border-radius: 3px;
  }

  .ticket-type-row {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }

  .ticket-type-select-wrap {
    max-width: none;
  }
}
```

(`.booking-action-button:disabled`'ın eski özel stili — `background`/`color`/`cursor` — artık gerekmiyor: buton zaten `.btn` primitifini de taşıyor, `.btn:disabled { opacity: 0.6; cursor: not-allowed; }` primitives.css'te tanımlı ve yeterli.)

Bu bloktan hemen sonra `.cart-page-heading { ... }` ile CartPage'in kendi bölümü başlıyor — ona dokunma.

- [ ] **Step 5: Testleri çalıştır**

Run: `npm run test:run -- BookingPage.test.jsx Stepper.test.jsx SeatMap.test.jsx Seat.test.jsx`
Expected: BookingPage 10/10, Stepper 5/5, SeatMap ve Seat mevcut sayılarıyla — hepsi PASS. Eğer BookingPage.test.jsx içinde `className` değerini birebir eşleştiren bir assertion varsa (örn. `"primary-button booking-action-button"` tam string kontrolü), yeni class listesine güncelle; rol/metin bazlı sorgular (`getByRole("button", {name: "Sepete Ekle"})`) etkilenmemeli.

- [ ] **Step 6: Lint ve build kontrolü**

```bash
npm run lint
npm run build
```

Expected: ikisi de hatasız.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/BookingPage.jsx frontend/src/App.css
git commit -m "feat(frontend): BookingPage'e Stepper, koltuk haritası perde eğrisi ve mobil alt panel ekle"
```
