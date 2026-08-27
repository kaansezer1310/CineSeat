# Frontend UI Revizyonu — Görev Bölüşümü (Kişi A / Kişi B)

> **Tarih:** 2026-08-27
> **Kapsam:** Faz 1'den itibaren kalan fazların iki kişi arasında bağımsız bölüşümü.
> **İlgili belgeler:** [`docs/superpowers/specs/2026-08-27-frontend-ui-revizyonu-design.md`](specs/2026-08-27-frontend-ui-revizyonu-design.md) (genel tasarım spec'i, tüm fazların tanımı), [`docs/superpowers/plans/`](plans/) (her fazın uygulama planı)

## Neden bu bölüşüm

Faz 1 (Header/Footer kabuğu) her sayfanın içine oturduğu için önce bitmesi gereken tek fazdı. Kalan
fazlar (2-6) sayfa/özellik bazında birbirinden büyük ölçüde bağımsız, bu yüzden "birlikte" bir
senkron adım olmadan iki kişiye bölünebiliyor. Kişi A, Faz 1'i zaten (bu sohbette) tamamladığı için
onu kendi track'inin ilk parçası olarak üstlendi.

## Bölüşüm

| Kim | Fazlar | İçerik |
|---|---|---|
| **Kişi A** | **Faz 1 → Faz 2 → Faz 3** | Header/CitySelector/CartButton/UserMenu/ThemeToggle/MobileMenu/Footer/Layout kabuğu **(tamamlandı)** → Landing yeniden yazımı + `/movies` ayrımı + Rail bileşeni → MovieDetails → Booking → Cart → Payment → Success/Error (koltuk haritası, stepper, ödeme akışı — en karmaşık ekranlar) |
| **Kişi B** | **Faz 4 → Faz 5 → Faz 6** | Profile, Login, Register, Cinemas, 404/403 + yeni statik sayfalar (about/contact/faq/privacy/terms/kvkk/refund) → Admin paneli (AdminLayout + 12 sayfa — tekrarlayan DataTable/FormDialog deseni) → Dark tema yeniden kurulumu + a11y/QA turu |

Her ikisi 3'er faz, tamamen bağımsız, hiçbir ortak/senkron adım yok.

## Durum

> Son güncelleme: 2026-08-28

| Faz | Kim | Durum |
|---|---|---|
| **0** — Token temeli | — | ✅ Tamamlandı, `frontend-revize`'e merge edildi. |
| **1** — Header/Footer kabuğu | Kişi A | ✅ Tamamlandı, final review + fix dalgası dahil. |
| **2** — Landing + `/movies` + Rail | Kişi A | ✅ Tamamlandı (`frontend-revize`). |
| **3** — Bilet akışı | Kişi A | ⬜ Henüz başlamadı. |
| **4** — Profil, auth, sinemalar, 404/403, statik sayfalar | Kişi B | ✅ Tamamlandı. |
| **5** — Yönetim paneli | Kişi B | ✅ Tamamlandı. |
| **6** — Koyu tema + a11y/QA | Kişi B | ✅ Tamamlandı. |

`frontend-revize` (Faz 0–2) `omer-cqrs-port`'a merge edildi; Faz 4–6 bu dalın üzerine işlendi.
Test sayısı 500 → 569.

### Kişi B'nin fazlarında alınan kararlar

Aşağıdakiler spec'ten **bilinçli sapmalar** — gerekçeleri ilgili commit ve kod yorumlarında da var:

- **"Yorumlarım" sekmesi eklenmedi** (spec §8'de geçiyor). `commentService` yalnızca film bazlı
  sorgu sunuyor; "bu kullanıcının yorumları" diye bir backend ucu yok ve spec §11 backend
  değişikliğini kapsam dışı bırakıyor. Uç eklendiğinde sekme `ProfilePage`'e girer.
- **`/campaigns` sayfası Faz 4'te yapıldı.** Bölüşüm tablosunda kimseye yazılmamıştı ama Header ve
  Footer bu rotaya bağlıydı ve 404'e düşüyordu. Yeni backend ucu gerekmiyor — landing ile aynı
  `/campaigns/active` verisini tüketiyor.
- **`PaymentPage` (Faz 3 alanı) minimal düzeyde elden geçti.** `.auth-*` sınıflarını kullandığı
  için, o stiller `App.css`'ten `auth.css`'e taşınırken kırılmaması adına `auth.css`'i içe
  aktarıyor ve input'ları `.input` primitifini aldı. Sayfa **yeniden tasarlanmadı**; Faz 3 onu
  kendi tasarımına geçirdiğinde bu bağlantı kaldırılabilir.
- **Yönetim panelinde koltuk ızgarası kasıtlı olarak ölçek dışı** bırakıldı (minyatür koltuk
  simgeleri, metin değil).

### Faz 3 (Kişi A) için notlar

Faz 4–6 sırasında Kişi A'nın alanını etkileyen üç şey oldu:

1. **`.movie-tab-list` / `.movie-tab-button` çakışması düzeltildi.** `App.css`'teki "Profile Tabs"
   bloğu bu iki sınıfı ikinci kez tanımlayıp `MoviesPage`'in hap biçimli sekmelerini eziyordu.
   Profil sekmeleri kendi `.profile-tab-*` adlarını aldı; `MoviesPage` artık tasarlandığı gibi
   render oluyor.
2. **Tema sözleşmesi artık test edilebilir.** `styles/theme-contract.test.js`, `tokens.css` dışında
   ham renk ya da `[data-theme=...]` dallanması yakalar. Faz 3'te yazılacak yeni CSS'in token
   kullanması **zorunlu** — aksi hâlde test kırılır.
3. **Kontrast bekçisi eklendi.** `styles/contrast.test.js` oranları `tokens.css`'ten okuyarak
   hesaplar; paleti değiştiren her düzenleme kontrastı bozduğu anda yakalanır.

### `App.css`'te bilinçli olarak bırakılanlar

Faz 4 `App.css`'i 3085 → 2652 satıra indirdi (auth + profil blokları kendi dosyalarına taşındı).
Kalan eski sınıflar (`.primary-button`, `.secondary-button`, `.temporary-panel`, `.page-heading`)
**kasıtlı olarak silinmedi** — hâlâ tüketen dosyalar var:

- **Faz 3'ün doğrudan kapsamı:** `MovieDetailsPage`, `BookingPage`, `CartPage`, `PaymentPage`,
  `SuccessPage`, `PaymentErrorPage`
- **Bilet akışının paylaşılan bileşenleri:** `SeatMap`, `SessionList`, `TrailerModal`, `CommentForm`
- **Ortak UI primitifleri:** `QueryState`, `StatusPanel`
- **`MoviesPage`** — Faz 2'de landing'den ayrıldı ama gövdesi eski `HomePage`'ten olduğu gibi
  taşındı; sekme/filtre kabuğu hâlâ eski sınıflarda.

Bu sınıflar `.btn` primitifine indiğinde (`spec §5`) `App.css`'ten silinebilir. Faz 3'ün son
görevi olarak yapılması mantıklı: o zaman tüketicilerin çoğu zaten elden geçmiş olacak.

## Fazların tam tanımı

Her fazın ne içerdiğinin detaylı açıklaması (bileşen listesi, davranış değişiklikleri, bilinçli
tersine çevirmeler) spec dokümanının §6-§10 bölümlerinde yer alıyor. Bu belge yalnızca "kim hangi
fazı yapıyor" bölüşümünü kayıt altına alıyor; fazların içeriği için spec'e bakılmalı.
