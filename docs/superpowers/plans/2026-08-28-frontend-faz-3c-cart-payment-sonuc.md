# Faz 3c — CartPage + PaymentPage + SuccessPage/PaymentErrorPage Yeniden Tasarımı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bilet satın alma akışının kalan dört sayfasını (CartPage, PaymentPage, SuccessPage, PaymentErrorPage) yeni tasarım diline taşımak: token tabanlı spacing/radius/shadow, `Stepper`'ın ödeme adımına (adım 3) eklenmesi, koltuk kilidi geri sayımının görsel olarak baskın hale getirilmesi (Faz 3a'da PaymentPage'e ertelenmişti).

**Architecture:** Faz 3'ün son dilimi — Faz 3a (Stepper + BookingPage) ve Faz 3b (MovieDetailsPage) tamamlandıktan sonra. Üç görev: (1) CartPage + `BookingPage`/`CartPage` arasında paylaşılan bilet-tipi CSS'inin tokenlanması (Faz 3a'da bilinçli olarak ertelenmişti — CartPage'e dokunmadan yapılamazdı). (2) PaymentPage — Stepper'ın üçüncü adımı + geri sayımın vurgulanması + sayfa çerçevesi. (3) SuccessPage + PaymentErrorPage (ikincisinin bugün hiç testi yok — bu görevde yazılıyor).

**Tech Stack:** React 19, Vite, düz CSS (Faz 0'da kurulan token katmanı), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-27-frontend-ui-revizyonu-design.md` (§8: BookingPage'in — mimari gereği PaymentPage'de yaşayan — geri sayım sayacının görsel olarak baskın olması isteniyordu, bu plan onu doğru yere, PaymentPage'e taşıyarak karşılıyor)

## Global Constraints

- **`.auth-*` class'larına (`.auth-form`, `.auth-field`, `.auth-row`, `.auth-error`, `.auth-field-error`, `.auth-submit`, `.auth-required`, `.auth-footer-text`, `.auth-link`, `.auth-card*`) HİÇBİR görevde DOKUNULMUYOR.** Bu class'lar `LoginPage`/`RegisterPage` ile paylaşılıyor — proje görev bölüşümünde (`docs/superpowers/2026-08-27-frontend-gorev-bolusumu.md`) bu sayfalar "Kişi B"nin Faz 4'üne ait, tamamen bağımsız çalışıyor. `PaymentPage.jsx`'in kart/alıcı formu bugünkü `.auth-*` görünümünü aynen koruyor; bu plan yalnızca sayfanın kendine özel çerçevesini (başlık, Stepper, geri sayım, özet paneli) modernize ediyor.
- **`.primary-button`/`.secondary-button`/`.page-actions` class'larına DOKUNULMUYOR** — düzinelerce sayfada (CinemasPage, ForbiddenPage, NotFoundPage, vb.) paylaşılıyorlar. Bu görevlerdeki sayfalarda bu class'lar aynen kullanılmaya devam ediyor (bazı yerlerde ek olarak `.btn` primitifleri de uygulanıyor, ama `.primary-button`/`.secondary-button`'ın kendisi silinmiyor/değiştirilmiyor).
- `.booking-ticket-types, .cart-ticket-types` birleşik seçicisi ve altındaki `.ticket-type-*` kuralları hem `BookingPage` (Faz 3a'da tamamlandı) hem `CartPage` tarafından kullanılıyor — Task 1 bunu tokenlarken HER İKİ sayfayı da güncellemiş olacak (BookingPage'e ayrıca dokunulmuyor, JSX'i değişmiyor, yalnızca paylaşılan CSS güncelleniyor).
- `.payment-error-hint, .payment-summary-note` birleşik seçicisi Task 2'de tokenlanıyor; Task 3 (PaymentErrorPage) bunu olduğu gibi tüketiyor, tekrar tanımlamıyor.
- Yeni class isimleri `tokens.css`/`primitives.css`'teki mevcut token'ları kullanır (ham renk/px değeri yazılmaz).
- Her görev sonunda `npm run lint`, `npm run test:run` yeşil olmalı. Son görev ayrıca `npm run build` çalıştırır (faz kapanışı).

---

### Task 1: CartPage yeniden tasarımı + paylaşılan bilet tipi CSS'inin tokenlanması

**Files:**
- Modify: `frontend/src/pages/CartPage.jsx`
- Modify: `frontend/src/App.css:887-1011` (paylaşılan `.ticket-type-*`/`.booking-ticket-types,.cart-ticket-types` bloğu)
- Modify: `frontend/src/App.css:1094-1340` (`.cart-page-heading` → `.cart-empty-intro .primary-button`, iki medya sorgusu dahil)

**Interfaces:**
- `CartPage.jsx`'in state/hook/handler mantığı (sepet reducer, kampanya ön izleme hesabı, checkout) **değişmiyor** — yalnızca JSX class isimleri.

- [ ] **Step 1: Paylaşılan bilet tipi CSS'ini tokenla**

`frontend/src/App.css` içinde `.booking-ticket-types,\n.cart-ticket-types {` ile başlayıp `.cart-ticket-types { margin-top: 16px; padding-top: 0; border-bottom: 0; }` kuralının kapanışına kadarki bölümün TAMAMINI şununla değiştir:

```css
.booking-ticket-types,
.cart-ticket-types {
  display: grid;
  gap: var(--space-3);

  padding: var(--space-4) 0 var(--space-5);

  border-bottom: 1px solid var(--color-border);
}

.booking-ticket-types-heading,
.cart-ticket-types-heading {
  color: var(--color-text-muted);

  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.01em;
}

.ticket-type-list {
  display: grid;
  gap: var(--space-3);

  margin: 0;
  padding: 0;

  list-style: none;
}

.ticket-type-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(140px, 160px);
  gap: var(--space-4);
  align-items: center;
  min-width: 0;
}

.ticket-type-row label {
  min-width: 0;
  overflow: hidden;

  color: var(--color-text);

  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ticket-type-select-wrap {
  position: relative;

  width: 100%;
  min-width: 0;
}

.ticket-type-select-wrap::after {
  content: "";
  position: absolute;
  top: 50%;
  right: var(--space-4);

  width: 10px;
  height: 6px;

  background-color: var(--color-purple);
  clip-path: polygon(0 0, 100% 0, 50% 100%);

  transform: translateY(-50%);

  pointer-events: none;
}

.ticket-type-select {
  display: block;

  width: 100%;
  min-height: 44px;
  padding: 0 2.4rem 0 var(--space-4);

  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);

  background-color: var(--color-background-soft);
  color: var(--color-text);

  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  line-height: 1.2;

  cursor: pointer;

  appearance: none;
  -webkit-appearance: none;
}

.ticket-type-select:hover:not(:disabled) {
  border-color: var(--color-purple-light);
  background-color: var(--color-surface-light);
}

.ticket-type-select:focus-visible {
  border-color: var(--color-purple);
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.ticket-type-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ticket-type-select option {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.cart-ticket-types {
  margin-top: var(--space-4);
  padding-top: 0;
  border-bottom: 0;
}
```

- [ ] **Step 2: CartPage'in CSS bölümünü tokenla**

`frontend/src/App.css` içinde `.cart-page-heading {` ile başlayıp `.cart-empty-intro .primary-button { margin-top: 18px; }` kuralının kapanışına kadarki (yani hemen ardından gelen `@media (max-width: 900px)` bloğundan ÖNCEKİ) bölümün TAMAMINI şununla değiştir:

```css
.cart-page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-6);

  margin-bottom: var(--space-6);
}

.cart-page-heading .page-heading {
  margin-bottom: 0;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-6);
  align-items: start;
}

.cart-list {
  display: grid;
  gap: var(--space-4);
}

.cart-item {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: var(--space-6);

  padding: var(--space-5);

  border-radius: var(--radius-lg);

  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.cart-item-content {
  flex: 1;
  min-width: 0;
}

.cart-item-session {
  margin: 0 0 var(--space-2);

  color: var(--color-text-muted);

  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
}

.cart-item h2 {
  margin: 0 0 var(--space-4);

  color: var(--color-text);

  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.cart-item-details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-8);
}

.cart-item-details p {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  margin: 0;
}

.cart-item-details span {
  color: var(--color-text-muted);

  font-size: var(--text-xs);
}

.cart-item-details strong {
  color: var(--color-text);

  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.cart-item-actions {
  display: flex;
  flex-shrink: 0;
  align-items: flex-end;
  justify-content: space-between;
  flex-direction: column;
  gap: var(--space-5);
}

.cart-item-total {
  color: var(--color-purple);

  font-size: var(--text-xl);
  font-weight: var(--weight-black);
}

.remove-cart-item-button {
  padding: 0;

  background: transparent;
  color: var(--color-text-muted);

  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);

  cursor: pointer;

  transition: color var(--duration-fast) var(--ease-out);
}

.remove-cart-item-button:hover {
  color: var(--color-text);
}

.cart-summary {
  position: sticky;
  top: 96px;

  padding: var(--space-6);

  border-radius: var(--radius-xl);

  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

.cart-summary h2 {
  margin: 0 0 var(--space-5);

  font-size: var(--text-xl);
  font-weight: var(--weight-black);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.cart-summary-row {
  display: flex;
  justify-content: space-between;
  gap: var(--space-5);

  padding: var(--space-3) 0;

  border-bottom: 1px solid var(--color-border);
}

.cart-summary-row span {
  color: var(--color-text-muted);
  font-weight: var(--weight-regular);
}

.cart-summary-row strong {
  color: var(--color-text);
  font-weight: var(--weight-semibold);
}

.cart-summary-total {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--space-5) 0;
}

.cart-summary-total span {
  color: var(--color-text-muted);

  font-weight: var(--weight-semibold);
}

.cart-summary-total strong {
  color: var(--color-purple);

  font-size: var(--text-xl);
  font-weight: var(--weight-black);
}

.cart-checkout-button {
  width: 100%;
}

.checkout-information {
  margin: var(--space-3) 0 0;

  color: var(--color-text-muted);

  font-size: var(--text-xs);
  line-height: 1.5;
  text-align: center;
}

.cart-empty-intro .primary-button {
  margin-top: var(--space-5);
}
```

(`.cart-checkout-button:disabled` kuralı bilinçli olarak kaldırıldı — bu buton hiçbir zaman `disabled` olmuyor, JSX'te hiç `disabled` prop'u yok; ölü kuraldı. `.remove-cart-item-button:disabled` bu bloğun İÇİNDE değil — dosyada çok daha ilerde, `.checkout-error` ile `.success-reservation-details` arasında ayrı duruyor; ona bu görev hiç dokunmuyor, Task 3'ün notuna bakın.)

Hemen ardından gelen `@media (max-width: 900px) { .cart-layout {...} .cart-summary {...} }` ve `@media (max-width: 650px) { ... }` bloklarına **dokunma** — içerikleri (grid-template-columns, position:static, flex-direction değişiklikleri) token gerektirmeyen yapısal kurallar, olduğu gibi kalıyor.

- [ ] **Step 3: CartPage.jsx'te buton class'larını primitiflere geçir**

"Sepeti Temizle" butonu:
```jsx
        <button
          className="secondary-button"
          type="button"
          onClick={handleClearCart}
        >
          Sepeti Temizle
        </button>
```
şuna değiştir:
```jsx
        <button
          className="btn btn--secondary btn--sm"
          type="button"
          onClick={handleClearCart}
        >
          Sepeti Temizle
        </button>
```

"Ödemeye Geç" butonu:
```jsx
          <button
            className="primary-button cart-checkout-button"
            type="button"
            onClick={handleCheckout}
          >
            Ödemeye Geç
          </button>
```
şuna değiştir:
```jsx
          <button
            className="btn btn--primary btn--lg cart-checkout-button"
            type="button"
            onClick={handleCheckout}
          >
            Ödemeye Geç
          </button>
```

Boş sepet durumundaki "Filmleri İncele" linki (`className="primary-button"`, zaten `/movies`'e gidiyor — Faz 2'nin final review düzeltmesiyle) **değişmiyor**, `.primary-button` olarak kalıyor (global class, dokunulmuyor).

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- CartPage.test.jsx BookingPage.test.jsx`
Expected: CartPage mevcut sayısıyla (5/5), BookingPage 10/10 — hepsi PASS. (BookingPage'i de çalıştırıyoruz çünkü Step 1 onun da kullandığı paylaşılan CSS'i değiştirdi — JSX'i etkilenmez ama regresyon olmadığını teyit etmek için.)

- [ ] **Step 5: Lint ve commit**

```bash
npm run lint
git add frontend/src/pages/CartPage.jsx frontend/src/App.css
git commit -m "feat(frontend): CartPage'i ve paylaşılan bilet tipi seçicisini tokenla"
```

---

### Task 2: PaymentPage — Stepper (adım 3) + geri sayımın görsel vurgusu + sayfa çerçevesi

**Files:**
- Modify: `frontend/src/pages/PaymentPage.jsx`
- Modify: `frontend/src/App.css:1671-1716` (`.payment-layout` → medya sorgusu)
- Modify: `frontend/src/App.css:3058-3082` (`.payment-card-brand` → `.payment-demo-notice`)

**Interfaces:**
- Consumes: `Stepper` (`components/ui/Stepper.jsx`, Faz 3a'da oluşturuldu — `{ steps, currentStepIndex }`), `.cart-summary`/`.cart-summary-row`/`.cart-summary-total*` (Task 1'de tokenlandı, `PaymentPage.jsx` bunları zaten `<aside className="payment-summary"><div className="cart-summary">...` şeklinde tekrar kullanıyor — bu görev CSS'lerini tekrar tanımlamıyor, olduğu gibi tüketiyor).
- `PaymentPage.jsx`'in state/hook/handler mantığı (koltuk kilidi, ödeme simülasyonu, rezervasyon mutation'ı, çift gönderim koruması) **değişmiyor** — yalnızca başlık bölümüne `Stepper` + yeni geri sayım işaretlemesi ekleniyor ve birkaç class ismi güncelleniyor.

**Karar (geri sayımın konumu):** Faz 3a'nın final review'ında ertelenen bir bulgu buydu — spec §8 geri sayımı "BookingPage"de istiyor ama mevcut mimaride koltuk kilidi (`seatService.lockSeats`) ve `useCountdown` PaymentPage'de yaşıyor; kilidi erkene çekmek davranış değişikliği olurdu. Bu görev, geri sayımı doğru yerinde (PaymentPage) görsel olarak baskın hale getirerek spec'in niyetini karşılıyor.

- [ ] **Step 1: Stepper importunu ve başlık bölümünü güncelle**

`frontend/src/pages/PaymentPage.jsx` dosyasının en üstündeki importlara ekle (satır 6, `useCountdown` importunun hemen altına):

```jsx
import useCountdown from "../hooks/useCountdown.js";
import Stepper from "../components/ui/Stepper.jsx";
```

Şu anki başlık bloğu:
```jsx
      <div className="page-heading">
        <h1>Ödeme</h1>

        <p>
          {isLocking ? (
            "Koltuklarınız ayrılıyor…"
          ) : (
            <>
              Koltuklarınız <strong>{formatTime()}</strong> boyunca geçici
              olarak kilitlendi.
            </>
          )}
        </p>

        <p className="payment-demo-notice" role="note">
          Bu bir <strong>demo ödemedir</strong>. Gerçek bir tahsilat yapılmaz
          ve kart bilgileriniz hiçbir yere kaydedilmez.
        </p>
      </div>
```

şuna değiştir:

```jsx
      <div className="page-heading">
        <h1>Ödeme</h1>

        <Stepper
          steps={["Koltuk", "Bilet Tipi", "Ödeme"]}
          currentStepIndex={2}
        />

        {isLocking ? (
          <p>Koltuklarınız ayrılıyor…</p>
        ) : (
          <div className="payment-countdown" role="status">
            <span className="payment-countdown-label">
              Koltuklarınız için kalan süre
            </span>
            <span className="payment-countdown-time">{formatTime()}</span>
          </div>
        )}

        <p className="payment-demo-notice" role="note">
          Bu bir <strong>demo ödemedir</strong>. Gerçek bir tahsilat yapılmaz
          ve kart bilgileriniz hiçbir yere kaydedilmez.
        </p>
      </div>
```

- [ ] **Step 2: App.css'e geri sayım stilini ekle**

`frontend/src/App.css`'te `.payment-layout {` kuralının HEMEN ÜSTÜNE ekle:

```css
.payment-countdown {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);

  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-5);

  border-radius: var(--radius-pill);

  background: var(--color-accent-soft);
}

.payment-countdown-label {
  color: var(--color-yellow-text);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.payment-countdown-time {
  color: var(--color-yellow-text);
  font-size: var(--text-2xl);
  font-weight: var(--weight-black);
  font-variant-numeric: tabular-nums;
}

```

- [ ] **Step 3: App.css'te payment-layout bölümünü tokenla**

`.payment-layout {` ile başlayıp `.payment-summary { position: sticky; top: 96px; }` kuralının kapanışına kadarki (yani hemen ardından gelen `@media (max-width: 900px)` bloğundan ÖNCEKİ) bölümün TAMAMINI şununla değiştir:

```css
.payment-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--space-6);
  align-items: start;
}

.payment-form {
  padding: var(--space-6);

  border-radius: var(--radius-xl);

  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

.form-group-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group-section h2 {
  margin: 0;

  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.payment-summary {
  position: sticky;
  top: 96px;
}
```

Hemen ardından gelen `@media (max-width: 900px) { .payment-layout {...} .payment-summary {...} }` bloğuna **dokunma**.

- [ ] **Step 4: App.css'te kart markası/ipucu stillerini tokenla**

`.payment-card-brand {` ile başlayıp `.payment-demo-notice { ... }` kuralının kapanışına kadarki bölümün TAMAMINI şununla değiştir:

```css
.payment-card-brand {
  color: var(--color-purple);
  font-weight: var(--weight-semibold);
}

.payment-error-hint,
.payment-summary-note {
  margin: var(--space-2) 0 0;

  color: var(--color-text-muted);

  font-size: var(--text-sm);
}

.payment-demo-notice {
  padding: var(--space-3) var(--space-4);
  margin-top: var(--space-3);

  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);

  color: var(--color-text-muted);

  font-size: var(--text-sm);
}
```

- [ ] **Step 5: Testleri çalıştır**

Run: `npm run test:run -- PaymentPage.test.jsx Stepper.test.jsx`
Expected: PaymentPage 10/10, Stepper 5/5 — hepsi PASS. Hiçbir test `formatTime()`'ın eski metin biçimini ("Koltuklarınız X boyunca...") veya `.payment-countdown` öncesi yapıyı doğrulamıyor (kontrol edildi) — değişiklik testleri kırmamalı.

- [ ] **Step 6: Lint ve build kontrolü**

```bash
npm run lint
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/PaymentPage.jsx frontend/src/App.css
git commit -m "feat(frontend): PaymentPage'e Stepper ekle, koltuk kilidi geri sayımını görsel olarak vurgula"
```

---

### Task 3: SuccessPage + PaymentErrorPage yeniden tasarımı + PaymentErrorPage.test.jsx (yeni)

**Files:**
- Modify: `frontend/src/App.css:52-96` (`.success-page` → `.success-page p`, `.primary-button` kuralından HEMEN ÖNCE durur)
- Modify: `frontend/src/App.css:1342-1427` (`.checkout-error` → `.success-reservation-details div:last-child strong`)
- Test: `frontend/src/pages/PaymentErrorPage.test.jsx` (YENİ — bu sayfanın bugün hiç testi yok)

**Interfaces:**
- `SuccessPage.jsx`/`PaymentErrorPage.jsx`'in kendisi **değişmiyor** — bu görev yalnızca CSS'lerini tokenlıyor ve eksik testi yazıyor. `.primary-button`/`.secondary-button`/`.page-actions` class'ları (her iki sayfa da bunları kullanıyor) bu görevde de dokunulmuyor (Global Constraints).

- [ ] **Step 1: App.css'te success-page bölümünü tokenla**

`frontend/src/App.css` içinde `.success-page {` ile başlayıp `.success-page p { ... }` kuralının kapanışına kadarki bölümün TAMAMINI (hemen ardından `.primary-button { ... }` geliyor — ONA DOKUNMA) şununla değiştir:

```css
.success-page {
  max-width: 620px;
  margin: var(--space-10) auto 0;
  padding: var(--space-12) var(--space-8);

  border-radius: var(--radius-xl);

  background: var(--color-surface);
  box-shadow: var(--shadow-md);

  text-align: center;
}

.success-icon {
  display: grid;

  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-5);

  place-items: center;

  border-radius: var(--radius-pill);

  background: var(--color-success);
  color: var(--color-on-primary);

  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
}

.success-page h1 {
  margin: 0;

  font-size: var(--text-3xl);
  font-weight: var(--weight-black);
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.success-page p {
  margin: var(--space-4) 0 var(--space-8);

  color: var(--color-text-muted);
  line-height: 1.55;
}
```

- [ ] **Step 2: App.css'te checkout-error ve success-reservation-details bölümlerini tokenla**

`.checkout-error {` ile başlayıp `.checkout-error p { ... }` kuralının kapanışına kadarki bölümün TAMAMINI şununla değiştir:

```css
.checkout-error {
  margin-bottom: var(--space-5);
  padding: var(--space-4);

  border: 1px solid var(--color-error-border);
  border-radius: var(--radius-md);

  background: var(--color-error-bg);
}

.checkout-error strong {
  display: block;
  margin-bottom: var(--space-2);

  color: var(--color-error-text);

  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.checkout-error p {
  margin: 0;

  color: var(--color-text-muted);

  font-size: var(--text-sm);
  line-height: 1.5;
}
```

Hemen ardından gelen `.remove-cart-item-button:disabled { ... }` kuralına **dokunma** — `CartPage.jsx`'teki "Sepetten Kaldır" butonu hiçbir zaman `disabled` olmuyor (JSX'te bu prop hiç kullanılmıyor), bu yüzden bu kural bugün zaten ölü kod; kapsam dışı bırakılıyor, silinmiyor.

`.success-reservation-details {` ile başlayıp `.success-reservation-details div:last-child strong { ... }` kuralının kapanışına kadarki bölümün TAMAMINI şununla değiştir:

```css
.success-reservation-details {
  display: grid;
  gap: 0;

  width: min(100%, 470px);
  margin: var(--space-8) auto;

  overflow: hidden;

  border-radius: var(--radius-lg);

  background: var(--color-background-soft);
}

.success-reservation-details div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);

  padding: var(--space-4) var(--space-5);

  border-bottom: 1px solid var(--color-border);
}

.success-reservation-details div:last-child {
  border-bottom: 0;
}

.success-reservation-details span {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.success-reservation-details strong {
  color: var(--color-text);

  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  text-align: right;
}

.success-reservation-details div:last-child strong {
  color: var(--color-purple);

  font-size: var(--text-lg);
  font-weight: var(--weight-black);
}
```

- [ ] **Step 3: PaymentErrorPage.test.jsx'i yaz (yeni dosya)**

```jsx
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { clearStoredLocks } from "../services/seatLockStorage.js";
import PaymentErrorPage from "./PaymentErrorPage.jsx";

vi.mock("../services/seatLockStorage.js", () => ({
  clearStoredLocks: vi.fn(() => Promise.resolve()),
}));

function renderPaymentErrorPage(state) {
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/payment-error", state }]}
    >
      <Routes>
        <Route
          path="/payment-error"
          element={<PaymentErrorPage />}
        />
        <Route path="/payment" element={<p>Ödeme sayfası</p>} />
        <Route path="/cart" element={<p>Sepet sayfası</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PaymentErrorPage", () => {
  it("state'teki reddedilme sebebini gösterir", () => {
    renderPaymentErrorPage({ reason: "Kart limiti yetersiz." });

    expect(
      screen.getByText("Kart limiti yetersiz.")
    ).toBeInTheDocument();
  });

  it("sebep verilmemişse genel bir mesaj gösterir", () => {
    renderPaymentErrorPage(undefined);

    expect(
      screen.getByText("Kredi kartı işleminiz tamamlanamadı.")
    ).toBeInTheDocument();
  });

  it("'Tekrar Dene' /payment'e gider", async () => {
    renderPaymentErrorPage({ reason: "Kart reddedildi." });

    fireEvent.click(
      screen.getByRole("link", { name: "Tekrar Dene" })
    );

    expect(
      await screen.findByText("Ödeme sayfası")
    ).toBeInTheDocument();
  });

  it("'Sepete Dön' kilitleri temizler ve /cart'a gider", async () => {
    renderPaymentErrorPage({ reason: "Kart reddedildi." });

    fireEvent.click(
      screen.getByRole("button", { name: "Sepete Dön" })
    );

    expect(clearStoredLocks).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText("Sepet sayfası")
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Testleri çalıştır**

Run: `npm run test:run -- SuccessPage.test.jsx PaymentErrorPage.test.jsx`
Expected: SuccessPage mevcut sayısıyla (4/4), PaymentErrorPage 4/4 (yeni) — hepsi PASS.

- [ ] **Step 5: Faz kapanışı — tüm suite + lint + build**

Spec §9 kuralı: her faz sonunda lint/test/build yeşil olmadan bir sonraki faza geçilmez. Bu, Faz 3'ün tamamını (3a+3b+3c) kapatan son adım.

Run: `npm run lint`
Run: `npm run test:run`
Run: `npm run build`

Expected: üçü de hatasız/yeşil.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/App.css frontend/src/pages/PaymentErrorPage.test.jsx
git commit -m "feat(frontend): SuccessPage/PaymentErrorPage'i tokenla, PaymentErrorPage.test.jsx ekleyerek Faz 3'ü tamamla"
```
