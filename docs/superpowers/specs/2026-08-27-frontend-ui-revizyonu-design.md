# CineSeat Frontend UI Revizyonu — Tasarım Dokümanı

> **Tarih:** 2026-08-27
> **Kapsam:** `frontend/` — herkese açık site (13 sayfa) + admin paneli (12 sayfa), tam revizyon.
> **Durum:** Onaylandı. İmplementasyon Sonnet ile, faz faz yürütülecek.
> **İlgili belgeler:** [`FRONTEND_DENETIM_VE_PLAN.md`](../../FRONTEND_DENETIM_VE_PLAN.md), [`FRONTEND_TARTISILACAKLAR.md`](../../FRONTEND_TARTISILACAKLAR.md)

---

## 1. Amaç ve mevcut durum

CineSeat'in frontend'i işlevsel ama görsel olarak profesyonel bir bilet satış sitesi
hissi vermiyor. Bu revizyonun amacı: modern, sakin (light-first), tutarlı bir tasarım
sistemi kurmak ve landing page'i gerçek bir vitrine dönüştürmek (header + footer dahil).

**Mevcut durumun tespit edilen zayıf noktaları:**

- Token katmanı yalnızca renk içeriyor (`src/index.css`); spacing, tipografi ölçeği,
  radius, gölge, motion **hiç tanımlı değil** — hepsi bileşenlerin içine sabit değer
  olarak dağılmış.
- `src/App.css` tek başına **3248 satır**, `admin.css` 935 satır — monolitik, tutarsız
  isimlendirme, 7 farklı buton class'ı (`.primary-button`, `.secondary-button`,
  `.refresh-button`, `.booking-action-button`, `.cart-checkout-button`,
  `.clear-selection-button`, `.remove-cart-item-button`).
- Tema ters kurulmuş: `:root` = dark (varsayılan), light `body[data-theme="light"]`
  altında sonradan yamalanmış bir override.
- Header tek sırada logo + 8 link + sepet + tema butonu; mobil menü yok, arama yok,
  şehir seçici yok.
- **Footer hiç yok.**
- Landing page (`HomePage.jsx`) aslında vitrin değil — doğrudan "Vizyonda / Yakında"
  sekmesi + film grid'i. Hero yok, kampanya yok. `src/assets/hero.png` mevcut ama
  hiçbir yerde kullanılmıyor.
- İyi haber: `components/ui/` altında zaten primitif seti var (PageHeader, StatCard,
  DataTable, FormDialog, FormField, ConfirmDialog, EmptyState, QueryState,
  StatusPanel) — tasarım sistemi bunların üzerine kurulabilir, yeniden yazılmıyor.
- 188 test geçiyor, çoğu erişilebilir isim/rol üzerinden sorguluyor (bkz. §7).

---

## 2. Stil teknolojisi kararı

**Düz CSS + gerçek bir token katmanı.** Tailwind'e geçilmiyor.

Gerekçe: Tailwind bir yazım kısayolıdır, görsel kalite üreticisi değildir —
`bg-slate-50 rounded-xl shadow-sm` ile `background: var(--surface); border-radius:
var(--radius-lg); box-shadow: var(--shadow-sm)` tarayıcıda birebir aynı pikselleri
üretir. Asıl sorun CSS teknolojisi değil, tasarım sisteminin hiç olmamasıydı.
Tailwind'e geçiş 100+ dosyanın JSX'ini baştan yazmayı, test kırılmalarını katlamayı ve
yeni bir bağımlılığı gerektirirdi — kazancı bu maliyeti karşılamıyor.

---

## 3. Görsel kimlik kararları

Bu üç karar, kullanıcıyla birlikte görsel companion üzerinden karşılaştırmalı
mockup'lar incelenerek alındı.

### 3.1 Renk paleti — "Gece Yarısı Moru"

Mevcut mor + mat altın marka kimliğinin light-first'e taşınmış hali. Marka
sürekliliği korunuyor (logo, tanıdıklık aynı kalıyor), nötrler hafif lavanta
kırılımlı (saf griden daha az yorucu).

| Rol | Değer |
|---|---|
| Zemin (canvas) | `#FAF8FC` |
| Yüzey (surface) | `#FFFFFF` |
| Soluk yüzey (muted) | `#F2EFF7` |
| Kenarlık (border) | `#E4DFEC` |
| Metin | `#1E1A26` |
| Soluk metin | `#6B6478` |
| Birincil (primary) | `#5B3E8E` |
| Birincil koyu (primary-2, hover/active) | `#4A3175` |
| Vurgu (accent) | `#E0A82E` |
| Vurgu — soluk zemin | `#FBF0D8` |
| Vurgu — zemin üstü metin | `#7A5A0E` |
| Uyarı (warn / geçici kilit) | `#B5761F` |
| Başarı | `#2E7D5B` / soluk zemin `#E2F1EA` |
| Hata | `#C0392B` / soluk zemin `#FBE7E4` |
| Dolu koltuk zemin/metin | `#D5D0DC` / `#5F5869` |

Koltuk haritasının dört durumu (boş/seçili/geçici kilitli/dolu) ve başarı/hata
bildirimleri bu paletle görsel companion'da test edildi; hue çeşitliliği durumları
birbirinden net ayırmaya yetiyor.

### 3.2 Tasarım dili — "Yumuşak Modern"

- **Tipografi:** Source Sans 3 → **Plus Jakarta Sans** (400/500/600/700/800,
  `latin-ext` alt kümesi — Türkçe karakterler için gerekli). Tek font ailesi; ayrı bir
  başlık fontu yok. Hiyerarşi ağırlık (800 başlıklarda) + sıkı harf aralığıyla
  (`-0.03em` display boyutlarında) kuruluyor.
- **Köşe yarıçapı:** iri, yuvarlak — 10 / 14 / 20px ölçeği (buton / kart / modal).
- **Derinlik:** kenarlık yerine **katmanlı yumuşak gölge** birincil ayraç aracı.
  Örnek: `box-shadow: 0 10px 30px rgba(76,52,112,.10), 0 2px 6px rgba(76,52,112,.05)`.
- **Butonlar:** dolgun, radius 12–14px, birincil buton hafif gölgeli
  (`0 6px 18px rgba(91,62,142,.28)` gibi).
- **Etiketler/rozetler:** hap biçimli (pill), soluk vurgu zemin üzerinde koyu vurgu
  metni (`--accent-soft` / `--accent-ink`).

### 3.3 Landing hero — "Bölünmüş: mesaj + poster yelpazesi" + hızlı bilet şeridi

Solda ürün vaadi + tek net CTA + güven rakamları (sinema sayısı, şehir sayısı,
kullanıcı puanı), sağda hafif eğik duran 3 posterlik yelpaze. Hemen altında ince bir
**hızlı bilet şeridi** (Şehir / Film / Tarih seçici + "Seansları Bul" CTA).

Gerekçe: veri modelinde yalnızca dikey poster var, yatay backdrop görseli yok — tam
genişlik backdrop hero'su gerçek veriyle bulanıklaştırılmış/gerilmiş poster
kullanmak zorunda kalırdı. Bölünmüş yapı elimizdeki posterle bugün çalışıyor ve
Yumuşak Modern diline en çok oturan yapı.

---

## 4. Token katmanı mimarisi

```
src/styles/tokens.css      → tüm tasarım kararları, tek kaynak
src/styles/base.css        → reset, body, tipografi varsayılanları, focus-visible
src/styles/primitives.css  → .btn, .card, .input, .badge, .chip, .skeleton…
src/styles/utilities.css   → .container, .stack, .rail, .visually-hidden
```

`tokens.css` içeriği:
- Ham palet → semantik roller (`--color-surface`, `--color-text-muted`,
  `--color-border`, …) — mevcut isimlendirme korunur, yalnızca değerler ve eksik
  kategoriler eklenir.
- 4px tabanlı boşluk ölçeği (`--space-1` … `--space-16`).
- Tipografi ölçeği (`--text-xs` … `--text-5xl`, display boyutları `clamp()` ile
  akışkan).
- Radius ölçeği (`--radius-sm/md/lg/xl/pill`).
- Katmanlı gölge ölçeği (`--shadow-sm/md/lg`).
- Motion süreleri/easing'leri (`--duration-fast/base/slow`, `--ease-out`),
  `prefers-reduced-motion` ile eşleştirilir (bkz. §9, Faz 6).
- Z-index ölçeği (header, dropdown, modal, toast).
- Container genişlikleri (`--container-sm/md/lg/xl`).

**İki kritik tersine çevirme:**

1. **`:root` artık light.** Dark tema `[data-theme="dark"]` altında yalnızca token'ları
   yeniden tanımlar; hiçbir bileşen CSS'i temaya göre dallanmaz. (Bugünkü tam ters:
   `:root` = dark, light sonradan override.)
2. **Tema attribute'u `<html>`'e taşınır** (bugün `body`). `index.html`'deki FOUC
   önleme script'i `<head>`'e çıkar, varsayılan `light` olur. `ThemeProvider`/`useTheme`
   `document.documentElement.dataset.theme` kullanacak şekilde güncellenir.

---

## 5. Bileşen primitifleri

Mevcut 7 buton class'ı tek `.btn` primitifine iner:
`.btn` + varyant (`--primary` / `--secondary` / `--ghost` / `--danger`) + boyut
(`--sm` / `--md` / `--lg`). Aynı birleştirme kartlar ve inputlar için de uygulanır.

**Yeni primitifler:**
- **Skeleton** — yükleme placeholder'ı. Bugün her yükleme durumu düz metin
  ("Filmler yükleniyor..."); modern sitelerde iskelet placeholder algılanan hızı
  belirgin şekilde iyileştirir.
- **Rail** — yatay kaydırmalı şerit (landing bölümleri, "Vizyondakiler" için).
- **Chip** — seans saati / filtre seçici.
- **Badge** — yaş sınırı, "YENİ" rozeti, sepet sayacı.
- **Stepper** — booking akışındaki 3 adım göstergesi.
- **Container / Section** — sayfa genişliği ve dikey ritim sarmalayıcıları.

Mevcut `components/ui/` seti (DataTable, FormDialog, FormField, ConfirmDialog,
EmptyState, QueryState, StatusPanel, StatCard, PageHeader) **korunur** — yalnızca iç
stilleri token'lara bağlanır, API'leri değişmez.

---

## 6. Kabuk: Header + Footer

`Layout.jsx` bugün tek dosyada her şeyi tutuyor; bölünüyor:

```
components/layout/
  Header.jsx
  CitySelector.jsx
  CartButton.jsx
  UserMenu.jsx
  ThemeToggle.jsx
  MobileMenu.jsx    (hamburger, focus trap, Esc ile kapanma)
  Footer.jsx
  Layout.jsx         → SkipLink + Header + <main> + Footer
```

**Header:** solda logo + 3 ana bölüm (Filmler / Sinemalar / Kampanyalar); sağda şehir
seçici, arama ikonu, rozetli sepet butonu, tema butonu, giriş/kullanıcı menüsü.
Yönetim linki yalnızca yetkili kullanıcıya (mevcut `PermissionGate` mantığı korunur).
Mobilde sol taraf hamburger menüye iner; sepet ve arama görünür kalır.

**Bilinçli davranış değişikliği:** Bugün header her iki temada da kasten koyu kalıyor
("marka çıpası", `--color-header-*` override edilmiyor). Yeni tasarımda **header açık
yüzey + alt kenarlık**, koyu olan **footer**. Sayfa açık başlayıp koyu kapanıyor. Bu,
mevcut yorumlanmış kararın (`index.css` içindeki not) bilinçli bir tersine
çevrilmesidir — kullanıcı onayı ile.

**Footer:** koyu mor zemin (`#231C30` civarı), 4 sütun (marka+sosyal / Keşfet /
Kurumsal / Yasal) + alt bar (telif satırı + ödeme rozetleri).

---

## 7. Bilgi mimarisi değişiklikleri

| Rota | Durum |
|---|---|
| `/` | **Yeniden yazılıyor** — vitrin: hero + hızlı bilet şeridi + bölümler (§7.1) |
| `/movies` | **Yeni** — bugünkü landing'in sekme+filtre+sıralama+grid mantığı buraya taşınır |
| `/campaigns` | **Yeni** — admin panelindeki kampanya verisiyle beslenir |
| `/about`, `/contact`, `/faq`, `/privacy`, `/terms`, `/kvkk`, `/refund` | **Yeni** — ortak `LegalPage` kabuğu, içerik statik veri dosyasında |
| Diğer 13 rota (`/movies/:id`, `/booking/:id`, `/cart`, `/payment`, `/success`, `/cinemas`, `/login`, `/register`, `/profile`, `/admin/*` …) | Aynı adres, yeni tasarım sistemi uygulanır |

### 7.1 Landing bölüm sırası

1. Hero (bölünmüş + hızlı bilet şeridi)
2. Vizyondaki Filmler — yatay kaydırmalı poster şeridi (`Rail`) + "Tümünü gör →"
   (`/movies`'e link)
3. Yakında — vizyon tarihi rozetli şerit, izleme listesine ekleme burada
4. Kampanyalar — 2-3 kart, admin kampanya verisiyle beslenir
5. Sana Yakın Sinemalar — konum izni varsa mesafeye göre 3 sinema (mevcut Haversine
   kodu `CinemasPage.jsx`'ten yeniden kullanılır)
6. Nasıl Çalışır? — 3 adım: Filmini seç → Koltuğunu seç → Biletin hazır
7. Footer

---

## 8. Sayfa bazında öne çıkan değişiklikler

- **BookingPage** (en kritik ekran): üstte 3 adımlı `Stepper` (Koltuk → Bilet Tipi →
  Ödeme), koltuk haritası perde eğrisi ile, masaüstünde yapışkan özet sütunu / mobilde
  alt sayfa (bottom sheet), geri sayım sayacı (`useCountdown`) görsel olarak baskın.
- **MovieDetailsPage**: yatay backdrop olmadığı için posterin bulanıklaştırılmış
  kopyası zemin, poster üstte net duruyor. Meta chip'ler, sekmeler
  (Seanslar / Hakkında / Yorumlar), tarihe göre yapışkan seans seçici.
- **ProfilePage**: sekmeli (Biletlerim / İzleme Listem / Yorumlarım / Hesap).
  Biletler gerçek bilet görünümlü kartlar (perforasyon çentiği, QR alanı).
- **LoginPage / RegisterPage**: bölünmüş düzen — solda form, sağda poster kolajı.
- **Admin paneli**: aynı token'lar, daha sıkı yoğunluk profili (küçük boşluk/radius
  varyantı). Sidebar yeniden düzenlenir, tablolar sıkı, `AdminDashboard` StatCard'ları
  grafiklerle hizalanır.

---

## 9. Test stratejisi

**Kural:** erişilebilir isimler ve roller sabit kalır; değişen class isimleri ve DOM
iskeletidir. Testing Library sorguları (`getByRole`, `getByText`, `getByLabelText`)
büyük çoğunlukla olduğu gibi geçer. Kırılan bir test gerçek bir davranış değişikliğine
işaret eder — üstü örtülmez, incelenir.

**Bilinen istisna:** `HomePage.test.jsx` — sekme/filtre/sıralama mantığı `/movies`'e
taşındığı için testleri de `MoviesPage.test.jsx`'e taşınır.

**Yeni testler gereken alanlar:** `Header`, `Footer`, `MobileMenu` (klavye/focus-trap
dahil), yeni landing bölümleri, `CitySelector`.

Her faz sonunda `npm run lint`, `npm run test:run`, `npm run build` yeşil olmadan bir
sonraki faza geçilmez.

---

## 10. Uygulama fazları

| Faz | İçerik | Neden bu sırada |
|---|---|---|
| **0** | `tokens.css`/`base.css`/`primitives.css`, font değişimi, light-first tersine çevirme, tema attribute'unun `<html>`'e taşınması | Hiçbir sayfa görsel olarak elden geçmez; yalnızca zemin atılır. Testler bu fazda **tamamen** geçmeli — davranış değişikliği yok. |
| **1** | `Header`, `Footer`, `MobileMenu`, `Layout`, skip link | Her sayfada görünen kabuk önce oturur. |
| **2** | Landing yeniden yazımı + `/movies` ayrımı + `Rail` bileşeni | En görünür kazanç; landing sunumda ilk gösterilecek ekran. |
| **3** | Bilet akışı: `MovieDetailsPage` → `BookingPage` → `CartPage` → `PaymentPage` → `SuccessPage`/`PaymentErrorPage` | Ürünün kalbi, en yüksek trafik alan akış. |
| **4** | `ProfilePage`, `LoginPage`, `RegisterPage`, `CinemasPage`, `NotFoundPage`/`ForbiddenPage`, yeni statik sayfalar (`/about` vb.) | |
| **5** | Admin paneli (12 sayfa + `AdminLayout`) | En hacimli, kullanıcıya en az görünür kısım — sona bırakılır. |
| **6** | Dark tema yeniden kurulumu (`[data-theme="dark"]` token override'ları) + erişilebilirlik/QA turu + `prefers-reduced-motion` desteği | Token'lar oturduktan sonra ucuz bir ek; erken yapılırsa her fazda iki kez test gerekir. |

**Faz 0 kritik:** burada acele edilirse sonraki her faz yeniden sabit değer yazmaya
kayar ve elimizde yine tokensız bir yığın kalır. Faz 0 bitmeden Faz 1'e geçilmez.

---

## 11. Kapsam dışı / ertelenen

- Backend değişikliği gerektiren hiçbir şey bu revizyonun parçası değil (T1–T10
  kararları `FRONTEND_DENETIM_VE_PLAN.md`'de ayrı yürüyor).
- Gerçek ödeme entegrasyonu — simülasyon adaptörü aynen korunur.
- Kampanyalar için yeni backend uçları gerekmiyor; `/campaigns` sayfası mevcut admin
  kampanya verisini tüketir.
