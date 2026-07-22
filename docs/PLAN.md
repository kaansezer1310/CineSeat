# CineSeat Faz-1 — Sprint Planı ve Görev Dağılımı

**Proje:** CineSeat (React + Vite, mock veri, frontend)
**Ekip:** Kaan Sezer · Alptuğ Dursun · Ömer Faruk Çendek · İzzettin Berke Kuş
**Kaynak:** `docs/Work breakdown structure.png`, `docs/cineseat_projeanaliz (4).pdf` (REQ-01…REQ-27), `docs/WBS_GOREV_DAGILIMI.md`

---

## 1. Genel Bakış

WBS'teki 44 görevin **10'u** plan yazıldığında zaten tamamlanmıştı. Kalan 34 görev başlangıçta 4 kişiye dengeli dağıtılıp **9 sprinte** (kişi başı 1 task/sprint, sprint sonu review) bölünmüştü.

**Güncel durum (bu revizyon anında):** Sprint 1 ve Sprint 2'nin tamamı bitti. Kaan'ın görevleri, ekip kararıyla **Alptuğ tarafından devralınıp** `Alp` branch'inde tamamlandı ve `main`'e mergelendi (PR #14) — 5 görevin tamamı (1.4.5, 1.4.8, 1.4.7, 1.4.9, 1.2.9). Bu merge sırasında Berke'nin son maddesi **1.2.10 (kampanya/indirim motoru) da aynı çalışmanın içinde tamamlanmış** bulundu. Ardından **Berke kendi kalan 6 görevini de bitirdi** (1.3.3, 1.3.4, 1.3.8, 1.3.9, 1.3.10, 1.3.11 — bkz. §5). **37 görev tamamlanmış, 7 görev kalmış** — hepsi Ömer'in. Alptuğ kendi modülünün tamamını (8 görev) Sprint 1'de tek seferde bitirdiği için planın "kişi başı sprintte 1 task" modeli fiilen bozuldu; ekip de pratikte "her kişi kendi sıradaki backlog'unu kendi hızında bitiriyor, review iş bitince yapılıyor" şeklinde çalışmaya başladı.

> **Not — Kaan'ın işini Alptuğ'un devralması:** Alptuğ, kendi modülünü (1.5.x) Sprint 1'de bitirmiş olduğu için Sprint 3'te boştaydı; Kaan'ın backlog'unu (main'in gerisinde kalan eski bir noktadan dallanarak) bağımsız tamamladı. Bu, `main` ile birleştirilirken 6 dosyada gerçek conflict çıkardı (case-sensitivity dahil bkz. §8) — çözülüp doğrulandı (17 dosya/113 test, lint 0 hata, build başarılı) ve main'e alındı. **Fonksiyonel olarak tamamlandı ama iki gerçek boşluk kalmış** (aşağıda §5 Kaan bölümünde ve §8 Teknik Borç'ta işaretli): 1.4.7'nin kilit-sahiplik/token kontrolü hâlâ eksik (Y3), 1.4.9'da ödeme başarısız olunca koltuklar hemen serbest bırakılıyor (spesifikasyon "kilitli kalır, sayaç devam eder" diyordu).

**Bu revizyonla değişen şey:** Kaan, Ömer ve Berke'nin eskiden **S3'ten S9'a kadar tek tek dağıtılmış** kalan görevleri artık **tek bir "Sprint 3" (konsolide backlog)** altında toplandı. Sprint sınırları arasındaki zorunlu bekleme kaldırıldı; kişi içi görev **sırası** (bağımlılık zinciri) korundu — sadece "her görev ayrı bir sprint" kısıtı kaldırıldı. Review hâlâ yapılır, ama artık sprint sonunda değil, **her kişi kendi konsolide backlog'unu bitirdiğinde** (ya da makul bir ara noktada) yapılır.

### Kişi başı durum (bu revizyon anında)
| Kişi | Sahip olduğu modül | Toplam görev | Bitmiş | Kalan (→ tek "Sprint 3"e toplandı) |
|------|--------------------|:---:|:---:|:---:|
| **Alptuğ Dursun** | Yönetici Paneli, Lokasyon | 8 | **8** (kendi modülü) | **0 — ayrıca Kaan'ın 5 görevini de devralıp bitirdi** |
| **Kaan Sezer** | Rezervasyon, Ödeme, Kampanya | 8 | **8** (S1: 1.4.3, S2: 1.4.4, S3: 1.4.5/1.4.8/1.4.7/1.4.9/1.2.9 — Alptuğ tarafından) | **0 — ⚠️ 2 gerçek boşlukla (bkz. §8)** |
| **Ömer Faruk Çendek** | Kimlik, Profil, Favoriler, Tema | 9 | 2 (S1: 1.2.3, S2: 1.2.1) | 7 — artık hepsi başlatılabilir |
| **İzzettin Berke Kuş** | Katalog, Detay, Sosyal (yorum/puan) | 9 | **9** (S1: 1.3.1, S2: 1.3.5, S3: 1.3.6/1.3.3/1.3.4/1.3.8/1.3.9/1.3.10/1.3.11, 1.2.10 — Alptuğ'un Kaan işiyle birlikte) | **0 — modül tamamen bitti** |

Alptuğ'a yeni görev bu revizyonda **atanmadı** — bu tek taraflı bir karar değil, ekiple konuşulması gereken bir konu (bkz. `docs/SPRINT1_REVIEW.md` §5, §7). Şimdilik Alptuğ'un rolü: **entegrasyon desteği + code review + bug-fix** (kendi modülünde bulunan açık maddeler dahil, bkz. §7).

---

## 2. Zaten Tamamlanmış Görevler (tekrar yapılmayacak)

| # | Görev | Sprint | Kanıt |
|---|-------|:---:|-------|
| 1.1.1–1.1.4 | Tüm proje altyapısı (Vite, git, klasör, mock servis katmanı) | — | ✅ |
| 1.3.2 | Film kartı bileşeni | — | ✅ |
| 1.3.7 | Film detay sayfası (temel) | — | ✅ |
| 1.4.1 | Seans ve salon seçim ekranı | — | ✅ |
| 1.4.2 | Koltuk grid bileşeni | — | ✅ |
| 1.4.6 | Sepet işlemleri (kaldır / boşalt / geri) | — | ✅ |
| 1.4.10 | Başarı ekranı + rezervasyon no | — | ✅ `pages/SuccessPage.jsx`, format `RES-#####` (1.4.8 kapsamında düzeltildi) |
| 1.2.3 | Auth context ve oturum yönetimi (REQ-21) | S1 | ✅ `AuthContext`/`AuthProvider`/`useAuth` |
| 1.4.3 | Koltuk state makinesi: 4 durum (REQ-01) | S1 | ✅ `domain/seatStatus.js` |
| 1.5.1–1.5.8 | Admin panel + film CRUD + istatistik/rapor/CSV + sinemalar + geolocation | S1 | ✅ Alptuğ tek seferde bitirdi |
| 1.2.1 | Login / register sayfaları (REQ-16, REQ-21) | S2 | ✅ `LoginPage.jsx`/`RegisterPage.jsx` |
| 1.4.4 | Sepet yapısı + bilet tipi seçimi (REQ-02) | S2 | ✅ `domain/ticketType.js` |
| 1.3.1 | Vizyonda / Yakında sekme yapısı (REQ-08) | S2 (aslında S1'de bitmişti) | ✅ `HomePage.jsx` sekmeleri |
| 1.3.5 | Otomatik kategorizasyon ve arşiv (REQ-05) | S2 | ✅ `movieService.isMovieArchived` |
| 1.3.6 | Yakında 6 ay zaman kısıtı (REQ-15) | S3 | ✅ `movieService.isWithinComingSoonWindow` |
| 1.4.5 | Dinamik fiyat: çarpan + ara toplam (REQ-02) | S3 (Alptuğ) | ✅ `services/pricing.js` — `calcSubtotal(items)`, çarpanlar REQ-02 ile birebir |
| 1.4.8 | Ödeme simülasyon ekranı (REQ-26) | S3 (Alptuğ) | ✅ `pages/PaymentPage.jsx`, `/odeme` rotası, `RES-#####` üretimi |
| 1.4.7 | Geçici koltuk kilidi + 3 dk sayaç (REQ-19) | S3 (Alptuğ) | 🟡 Sayaç+kilit/kilit-açma çalışıyor; **kilit-çakışma (Y3) kontrolü hâlâ yok** — bkz. §8 |
| 1.4.9 | Ödeme başarısızlık ekranı (REQ-13) | S3 (Alptuğ) | 🟡 `PaymentErrorPage.jsx` var, test kartı (`0000...`) çalışıyor; **koltuklar hemen serbest kalıyor** (spesifikasyona aykırı) — bkz. §8 |
| 1.2.9 | Ziyaretçi bilgi formu (REQ-03) | S3 (Alptuğ) | ✅ `PaymentPage.jsx` içinde visitorForm, rezervasyona işleniyor |
| 1.2.10 | Kampanya + indirim motoru (REQ-10) | S3 (Alptuğ, Kaan işiyle birlikte) | ✅ `services/campaignService.js` — üyeye %10, ziyaretçiye yansımaz, `calcSubtotal` üzerine sıralı uygulanıyor |
| 1.3.3 | Sıralama modülü: tarih/puan (REQ-08.1) | S3 (Berke) | ✅ `movieService.sortMovies` + `SortControl.jsx` |
| 1.3.4 | Filtreleme modülü: tür/yaş (REQ-08.1) | S3 (Berke) | ✅ `movieService.filterMovies` + `FilterControl.jsx`, sıralamayla birlikte çalışıyor |
| 1.3.8 | Fragman modalı + fallback (REQ-09/09.1) | S3 (Berke) | ✅ `TrailerModal.jsx` — `fragmanYoutubeId` yoksa buton pasif, her zaman "YouTube'da Aç" linki |
| 1.3.9 | Puanlama 1-5 yıldız (REQ-11) | S3 (Berke) | ✅ `ratingService.js` + `RatingStars.jsx` — yalnız üye, sadece vizyondaki filmlerde |
| 1.3.10 | Yorum formu + kısıtlar (REQ-11.1) | S3 (Berke) | ✅ `commentService.js` + `CommentForm.jsx` — 10-500 karakter, yasaklı kelime, ziyaretçiye kapalı |
| 1.3.11 | Yorum listeleme + sıralama (REQ-11) | S3 (Berke) | ✅ `CommentList.jsx` — mock + kullanıcı yorumları, yeniden eskiye, sahibi düzenler/siler |

> **Dikkat — "bitti" ama düzeltme gerektiren yerler:**
> - 1.4.10 rezervasyon no formatı artık `RES-#####` (1.4.8 kapsamında düzeltildi) ✅.
> - Sprint 1–2'de bulunan kritik/yüksek öncelikli bulgular (case-sensitivity build hatası, `/admin` koruması, sahte admin istatistikleri, render-body'de `navigate()` çağrısı vb.) çoğunlukla düzeltildi — tam liste ve kalanlar `docs/SPRINT1_REVIEW.md`'de.
> - 1.4.7 ve 1.4.9'daki iki açık boşluk (kilit-çakışma kontrolü, başarısızlıkta kilit serbest bırakma) henüz sahiplenilmedi — bkz. §8.

---

## 3. Çalışma Kuralları (herkes için ortak)

1. **Branch:** Her task için `feature/<wbs-no>-kisa-ad` (örn. `feature/1.2.3-auth-context`). `main`e doğrudan push yok.
2. **PR:** Task bitince PR açılır; değişiklikler gözden geçirilir.
3. **Code review (zorunlu araç yok):** İnceleme **manuel** yapılabilir ya da **ekipten bir kişi** (review sorumlusu) tarafından toplu yapılabilir — herkesin bir araç çalıştırması gerekmez. Kimde `/code-review` gibi bir araç varsa kullanabilir, ama şart değildir. Amaç: bariz hatalar, bariz güvenlik/format sorunları ve kabul kriterlerinden sapmalar bir sonraki backlog'a taşınmadan yakalansın. **Sprint 3'ten itibaren:** review artık sprint sonunda değil, her kişi kendi konsolide backlog'unu (ya da makul bir ara noktasını) bitirdiğinde yapılır.
4. **Servis katmanı sözleşmesi:** Yeni veri erişimleri `src/services/*` altında, mevcut `async fetchX()` desenine uygun yazılır (Kalite Niteliği: Maintainability).
5. **Tema tokenları (kritik ortak kural):** Herkes renkleri doğrudan hex yazmaz; `src/index.css`/`src/App.css` içinde tanımlı CSS değişkenlerini (`var(--color-*)`) kullanır. Böylece Ömer'in Sprint 3 backlog'undaki Light/Dark tema işi (1.5.9) tüm ekranlara otomatik yansır, geri dönüş (rework) olmaz.
6. **Ara toplam sözleşmesi:** Kaan, Sprint 3 backlog'unun ilk maddesi olan **1.4.5**'te fiyat hesaplama fonksiyonunun imzasını (`calcSubtotal(items) -> number`) belirleyip paylaşır; kampanya indirimi (Berke'nin 1.2.10'u, aynı backlog'un son maddesi) bu çıktının üzerine uygulanır — bu yüzden Kaan'ın 1.4.5'i, Berke'nin 1.2.10'undan **önce** bitmiş olmalı (bkz. §6 Tek-Sprint Yürütme Sırası ve §7 Bağımlılık Haritası).
7. **Definition of Done (her task):** İlgili REQ karşılanır · boş/hata durumları (empty/error state) ele alınır · en az 1 birim testi (mümkünse) · lint temiz · responsive · tema tokenlarına uyumlu.

---

## 4. Sprint Özet Tablosu

| Sprint | Ömer (Kimlik/Profil) | Kaan (Rezervasyon/Ödeme) | Alptuğ (Admin/Lokasyon) | Berke (Katalog/Sosyal) |
|:---:|---|---|---|---|
| **S1** ✅ | 1.2.3 Auth context + oturum | 1.4.3 Koltuk 4 durum state makinesi | 1.5.7 + **1.5.1–1.5.6, 1.5.8** (tüm modül, plan dışı hızlı bitirildi) | 1.3.1 Vizyonda/Yakında sekme |
| **S2** ✅ | 1.2.1 Login / register sayfaları | 1.4.4 Sepet + bilet tipi seçimi | *(S1'de zaten bitmişti)* | 1.3.5 Otomatik kategorizasyon + arşiv |
| **S3** 🔵 (yeni, konsolide) | 1.2.2, 1.2.4, 1.2.5, 1.2.7, 1.2.8, 1.5.9, 1.2.6 — **7 görev, tek backlog (artık hepsi başlatılabilir, dış engel kalmadı)** | ~~1.4.5, 1.4.8, 1.4.7, 1.4.9, 1.2.9~~ ✅ **5/5 bitti (Alptuğ tarafından, `Alp` branch → main)** | *(kendi modülü + Kaan'ın 5 görevi de bitti)* | ~~1.3.6, 1.3.3, 1.3.4, 1.3.8, 1.3.9, 1.3.10, 1.3.11, 1.2.10~~ ✅ **8/8 bitti — modül tamamen kapandı** |

> Eski S3–S9 satırları bu revizyonla kaldırıldı; içerikleri (Kabul/Dosyalar/Bağımlılık) hiçbir bilgi kaybı olmadan aşağıdaki **§5 SPRINT 3** bölümünde, kişi bazlı ve bağımlılık sırasına göre korunuyor.

---

## 5. Sprint Detayları

Her task için: **Sahip · REQ · Ne yapılacak · Kabul kriterleri · Dosyalar · Bağımlılık.**

---

### 🟩 SPRINT 1 — Çekirdek altyapı — ✅ TAMAMLANDI

**1.2.3 Auth context ve oturum yönetimi** — *Ömer* · REQ-21 · ✅
Mock kullanıcı dizisi üzerinden e-posta+şifre doğrulama, oturum (kullanıcı+rol) için `AuthContext` + `AuthProvider`, `useAuth` hook.
- **Dosyalar:** `src/context/AuthContext.js`, `src/context/AuthProvider.jsx`, `src/hooks/useAuth.js`, `src/data/users.js`, `src/services/authService.js`, `src/components/layout/Layout.jsx`.

**1.4.3 Koltuk state makinesi: 4 durum** — *Kaan* · REQ-01 · ✅
BOS / SECILI / GECICI_KILITLI / DOLU state makinesi.
- **Dosyalar:** `src/domain/seatStatus.js`, `src/services/seatService.js`, `src/components/seats/Seat.jsx`, `src/components/seats/SeatMap.jsx`, `src/pages/BookingPage.jsx`.

**1.5.1–1.5.8 — Yönetici Paneli & Lokasyon (tüm modül)** — *Alptuğ* · REQ-04, REQ-06, REQ-07, REQ-07.1, REQ-20 · ✅
Admin panel layout, film CRUD formu, form validasyon + silme onayı, istatistik hesaplama, rapor tablo+grafik (`recharts`), CSV export (`react-csv`), sinemalar sayfası + şehir dropdown, geolocation + Haversine mesafe + fallback — planda 8 sprinte yayılmıştı, Alptuğ tek commit'te bitirdi.
- **Dosyalar:** `src/components/admin/AdminLayout.jsx`, `src/pages/admin/AdminMovieForm.jsx`, `src/pages/admin/AdminMoviesPage.jsx`, `src/pages/admin/AdminDashboard.jsx`, `src/pages/CinemasPage.jsx`, `src/services/movieService.js` (CRUD).

**1.3.1 Vizyonda / Yakında sekme yapısı** — *Berke* · REQ-08 · ✅
Ana sayfada "Vizyonda" ve "Yakında" iki sekme; geçiş sayfa yenilenmeden.
- **Dosyalar:** `src/pages/HomePage.jsx`, `src/data/movies.js`, `src/components/movies/MovieCard.jsx`, `src/services/movieService.js`.

---

### 🟩 SPRINT 2 — Giriş, bilet tipi, kategorizasyon — ✅ TAMAMLANDI

**1.2.1 Login / register sayfaları** — *Ömer* · REQ-16, REQ-21 · ✅
Giriş ve kayıt formu ekranları + rotaları.
- **Dosyalar:** `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/App.jsx`, `authService.js`, `AuthProvider.jsx`, `users.js`.

**1.4.4 Sepet yapısı + bilet tipi seçimi** — *Kaan* · REQ-02 · ✅
Her koltuğa bilet tipi (Yetişkin / Öğrenci / Çocuk) atama.
- **Dosyalar:** `src/domain/ticketType.js`, `src/context/cartReducer.js`, `src/pages/CartPage.jsx`, `src/pages/BookingPage.jsx`.

**1.3.5 Otomatik kategorizasyon ve arşiv** — *Berke* · REQ-05 · ✅
Vizyon süresi dolan filmleri ana sayfadan otomatik filtrele.
- **Dosyalar:** `src/services/movieService.js`, `src/pages/HomePage.jsx`.

> **Not:** Alptuğ'un plana göre bu sprintteki görevi olan 1.5.8 zaten Sprint 1'de bitmişti.

---

### 🔵 SPRINT 3 — Konsolide backlog (eski S3–S9'un birleşimi)

> Aşağıdaki görevler artık ayrı sprintlere bölünmüyor — her kişi kendi listesini, belirtilen sıraya göre (bağımlılık zinciri korunarak) kendi hızında bitirir. Review, backlog bitince (ya da makul bir ara noktada) yapılır.

#### 👤 Kaan — Rezervasyon & Ödeme (5 görev) — ✅ TAMAMLANDI (Alptuğ tarafından devralındı)

> Kaan'ın backlog'u, Alptuğ kendi modülünü bitirip boşta kaldığı için ekip kararıyla ona devredildi. `Alp` branch'inde bağımsız tamamlandı, `main`'e mergelenirken çıkan 6 conflict çözüldü (case-sensitivity dahil). **Fonksiyonel olarak 5/5 bitti, ama review'da 2 gerçek boşluk bulundu** (aşağıda işaretli, ayrıca §8 Teknik Borç'ta takip ediliyor).

**1. 1.4.5 Dinamik fiyat: çarpan + ara toplam** — REQ-02 · ✅
`src/services/pricing.js` — `calcSubtotal(items) -> number`, çarpanlar (Yetişkin ×1.00 / Öğrenci ×0.75 / Çocuk ×0.60) REQ-02 ile birebir, `formatPrice` ile TR yerelinde 2 ondalık. Berke'nin 1.2.10'unun tam beklediği sözleşmeyle uyumlu doğrulandı.

**2. 1.4.8 Ödeme simülasyon ekranı** — REQ-26 · ✅
`/odeme` rotası, `PaymentPage.jsx` — kart formu, hiçbir veri saklanmıyor/gönderilmiyor, başarıda `reservationService.createReservation` ile `RES-#####` üretiyor (REQ-22, eski `CS-…` formatı düzeltildi).

**3. 1.4.7 Geçici koltuk kilidi + 3 dk sayaç** — REQ-19 · 🟡 **Kısmen** — açık boşluk var
Sayaç (`useCountdown`) ve `lockSeats`/`releaseLockedSeats` çağrıları çalışıyor, süre bitince sepet boşalıp koltuk ekranına dönüyor. **Ama `SPRINT1_REVIEW.md` Y3'te uyarılan kilit-sahiplik/token kontrolü hâlâ eklenmemiş** — `seatService.js`'teki uyarı yorumu aynen duruyor, dokunulmamış. Yani iki kullanıcı ödeme sırasında hâlâ aynı koltuğu alabilir. **Sahibi yok, açık.**

**4. 1.4.9 Ödeme başarısızlık ekranı** — REQ-13 · 🟡 **Kısmen** — açık boşluk var
`PaymentErrorPage.jsx` var, test kartı (`0000` ile başlayan numara) başarısızlığı tetikliyor, "Tekrar Dene"/"Sepete Dön" çalışıyor. **Ama** `PaymentPage`'in `useEffect` cleanup'ı, `/odeme-hata`'ya geçişte (component unmount) koltukları **hemen serbest bırakıyor** — spesifikasyon "başarısızlıkta koltuklar `GECICI_KILITLI` kalır, sayaç devam eder" diyordu. Şu anki davranış daha muhafazakâr (koltuk daha hızlı serbest kalıyor) ama dokümandaki akıştan sapıyor. **Sahibi yok, açık.**

**5. 1.2.9 Ziyaretçi bilgi formu** — REQ-03 · ✅
`PaymentPage.jsx` içinde `visitorForm` (Ad/Soyad/E-posta), sadece ziyaretçi/guest için gösteriliyor, `payload.visitorInfo` olarak rezervasyona işleniyor. Küçük not: Ad-Soyad için REQ-03'ün istediği 2–50 karakter aralık doğrulaması yok, sadece `required` var — düşük öncelikli, ayrı not düşüldü.

> **🔍 Review sonucu:** Fiyat yuvarlama/format doğru · ödeme verisi hiçbir yere yazılmıyor · rezervasyon no gerçekten `RES-#####` · **kilit-çakışma kontrolü (Y3) hâlâ eklenmedi** · **başarısızlıkta kilit anında serbest kalıyor (spesifikasyona kısmen aykırı)** · visitorInfo ad-soyad uzunluk doğrulaması eksik. Son iki madde `SPRINT1_REVIEW.md`/§8'e taşındı, sahiplenilmesi gerekiyor.

#### 👤 Ömer — Kimlik, Profil & Favoriler (7 görev, sırayla)

**1. 1.2.2 Form doğrulama kuralları + regex** — REQ-16, REQ-17, Güvenlik 4.2
Kayıt/giriş validasyonları: kullanıcı adı 5–12, Türkçe/boşluk/özel karakter engeli (regex); şifre 6–15, en az bir harf+rakam+izinli özel karakter; ad-soyad 2–50.
- **Kabul:** Geçersiz girişte alan bazlı hata mesajı; regex kuralları REQ-17 ve 4.2 ile birebir; gönderim engellenir.
- **Dosyalar:** `src/services/validation.js`, `LoginPage`, `RegisterPage`.
- **Bağımlılık:** 1.2.1 ✅.

**2. 1.2.4 ProtectedRoute + rol kontrolü** — REQ-21, Güvenlik 4.2
Rol bazlı rota koruması; üye-only sayfalar (profil vb.) `member`. **Not:** `src/components/routing/ProtectedRoute.jsx` zaten var — Sprint 1 review'da bulunan `/admin` güvenlik açığını (K2) kapatmak için acil olarak eklendi, sadece `allowedRoles={["admin"]}` ile `/admin`'i sarıyor. Bu görev **sıfırdan yazmak değil, var olan bileşeni genişletmek**: üye-only rotalar, `/login`'e yönlendirme.
- **Kabul:** URL'den `/admin`e yetkisiz erişim engellenir (zaten var); üye-only rotalar da korunur (yeni).
- **Dosyalar:** `src/components/routing/ProtectedRoute.jsx` (var olanı genişlet), `src/App.jsx`.
- **Bağımlılık:** 1.2.3 ✅.

**3. 1.2.5 Profil sayfası** — REQ-18
Üye profil sayfası: kişisel bilgileri görüntüle/güncelle formu.
- **Kabul:** `/profil` (korumalı); bilgiler düzenlenip kaydedilir.
- **Dosyalar:** `src/pages/ProfilePage.jsx`, `authService`.
- **Bağımlılık:** 1.2.4 (madde 2). **Not:** Header'daki "Profilim" linki şu an `NotFoundPage`'e düşüyor — bu görev bitince gerçek sayfaya bağlanmalı.

**4. 1.2.7 İzleme listesi ikonu + state** — REQ-24
Kart ve detay sayfasında kalp/yer-imi ikonu; tıkla ekle/çıkar; dolu/boş görsel; anlık yansıma.
- **Kabul:** Favori state üyeye bağlı; anlık güncellenir.
- **Dosyalar:** `src/context/` (favori state veya `authService` içinde), `MovieCard.jsx`, `MovieDetailsPage.jsx`.
- **Bağımlılık:** 1.2.3 ✅.

**5. 1.2.8 İzleme listem sekmesi + bildirim** — REQ-25
Profile "İzleme Listem" sekmesi (afiş, ad, vizyon tarihi, kalan gün, çıkar butonu). Favori film vizyona girince girişte bildirim bandı.
- **Kabul:** Sekme + bildirim bandı çalışır.
- **Dosyalar:** `ProfilePage.jsx`, `HomePage.jsx`.
- **Bağımlılık:** 1.2.7 (madde 4).

**6. 1.5.9 Light / Dark mod** — REQ-23
Tek butonla, sayfa yenilemeden tema geçişi; durum Context/State'te; varsayılan Light. Sprint 1'den beri kullanılan CSS token'ları palete bağlanır.
- **Kabul:** Tüm ekranlar iki temada tutarlı; geçiş anlık.
- **Dosyalar:** `src/context/ThemeContext.jsx`, `Layout.jsx`, `src/index.css`.
- **Bağımlılık:** Token kuralı (§3.5) — Sprint 1–2'de zaten uyulmuş olmalı; bu görev bittiğinde Admin panelinin (Alptuğ) de tema tokenlarına uyumlu olup olmadığı ayrıca kontrol edilmeli (Alptuğ'un admin CSS'i ayrı yazılmıştı).

**7. 1.2.6 Bilet sekmeleri (Güncel / Geçmiş)** — REQ-18 · ⏸️ **Dış bağımlılık — Kaan'ı bekler**
Profilde gösterim saati geçmemiş → "Güncel Biletler", geçmiş → "Geçmiş Biletler".
- **Kabul:** Rezervasyonlar tarihe göre doğru sekmede; rezervasyon no gösterilir.
- **Dosyalar:** `ProfilePage.jsx`, `reservationService`.
- **Bağımlılık:** 1.2.5 (madde 3) **ve Kaan'ın ödeme akışı (1.4.8)** — bu madde Kaan'ın backlog'undaki 2. maddeden sonra bitirilmeli, aksi halde test edilecek gerçek rezervasyon verisi olmaz. **Bu yüzden listede en sona alındı** (Berke'nin 1.2.10'undaki desenle aynı mantık — tek dış bağımlılık en sonda, geri kalan 6 görev tamamen bağımsız tek oturumda bitirilebilir).

> **🔍 Review odağı (Ömer backlog'u bitince):** Regex kuralları edge-case testleriyle · `/admin` koruması hâlâ çalışıyor mu (ProtectedRoute genişletilirken bozulmadı mı) · favori/izleme state'i doğru üyeye bağlanıyor mu · tema geçişi admin panel dahil tüm ekranlarda tutarlı mı.

#### 👤 Berke — Katalog, Detay & Sosyal (8 görev) — ✅ TAMAMLANDI

**1. 1.3.6 Yakında 6 ay zaman kısıtı** — REQ-15 · ✅ **Tamamlandı**
"Yakında" listesini bugünden itibaren en fazla 6 ay içinde vizyona girecek filmlerle sınırla.
- **Kabul:** 6 aydan uzak filmler ana sayfada yok, sistemde/adminde kayıtlı.
- **Dosyalar:** `src/services/movieService.js` (`isWithinComingSoonWindow`), `HomePage.jsx`.
- **Bağımlılık:** 1.3.1 ✅, 1.3.5 ✅.

**8. 1.2.10 Kampanya + indirim motoru** — REQ-10 · ✅ **Tamamlandı (Alptuğ'un Kaan işiyle birlikte)**
Kaan'ın backlog'unu devralan Alptuğ, `campaignService.js`'i de aynı çalışmada yazmış: `getCampaignDiscount(subtotal, user)` — üye ise %10 indirim (sıralı/compounding uygulama), ziyaretçi/guest ise `discountAmount: 0`. `CartPage.jsx` ve `PaymentPage.jsx`'te `calcSubtotal`'ın üzerine uygulanıyor.
- **Kabul:** Üyeye indirim yansır ✅ · ziyaretçiye yansımaz ✅ · sıralı uygulama ✅ (kabul kriterleriyle birebir doğrulandı).
- **Dosyalar:** `src/services/campaignService.js`, `CartPage.jsx`, `PaymentPage.jsx`, `pricing.js`.
- **Not:** Sıra numarası 8 olarak kaldı (orijinal bağımlılık zincirini yansıtmak için), ama fiilen 1.3.6 ile aynı anda "bitmiş" durumda — kalan sıralı iş artık 2. maddeden başlıyor.

**2. 1.3.3 Sıralama modülü (tarih/puan)** — REQ-08.1 · ✅
`movieService.sortMovies(movies, sortValue)` (date-desc/asc, rating-desc/asc) + `SortControl.jsx`. Varsayılan `date-desc`. `HomePage.jsx`'te aktif sekmenin filmlerine uygulanıyor.
- **Dosyalar:** `src/services/movieService.js`, `src/components/movies/SortControl.jsx`, `HomePage.jsx`.
- **Testler:** 5 birim testi (movieService), 2 entegrasyon testi (HomePage).

**3. 1.3.4 Filtreleme modülü (tür/yaş)** — REQ-08.1 · ✅
`movieService.filterMovies` (tür + yaş sınırı) + `getAvailableGenres`/`getAvailableAgeRatings` + `FilterControl.jsx`. Sıralamayla birlikte çalışıyor; filtre sonucu boşsa "Seçtiğin filtrelere uyan film bulunamadı." mesajı (tabın kendisi boşsa farklı, orijinal mesaj korunuyor).
- **Dosyalar:** `src/services/movieService.js`, `src/components/movies/FilterControl.jsx`, `HomePage.jsx`.
- **Testler:** 6 birim testi, 2 entegrasyon testi.

**4. 1.3.8 Fragman modalı + fallback** — REQ-09, REQ-09.1 · ✅
`TrailerModal.jsx` — YouTube iframe embed, Escape/backdrop/kapat butonuyla kapanır. `fragmanYoutubeId` yoksa "Fragman İzle" butonu pasif (`movies.js`'te 3 film kasıtlı olarak `null` bırakıldı, fallback'in gerçekten test edilebilmesi için). İframe hata verirse (`onError`) veya normal durumda, her zaman görünen "YouTube'da Aç" linki var — tarayıcıda iframe yükleme başarısızlığını güvenilir tespit etmenin bir yolu olmadığı için bu iki katmanlı fallback bilinçli bir tasarım kararı.
- **Dosyalar:** `src/components/movies/TrailerModal.jsx`, `MovieDetailsPage.jsx`, `movies.js` (`fragmanYoutubeId` alanı eklendi).
- **Testler:** 4 entegrasyon testi (buton pasif/aktif, modal aç/kapat, Escape).

**5. 1.3.9 Puanlama 1-5 yıldız** — REQ-11 · ✅
`ratingService.js` (localStorage'da kullanıcı başına 1 puan, seed ortalamasının üzerine ağırlıklı ekleniyor) + `RatingStars.jsx`. Yalnız üye puanlayabilir; sadece **vizyondaki** (yayınlanmış) filmlerde gösteriliyor — REQ-11'in "Vizyonda film detayında" ifadesine sadık kalındı, "Yakında" filmlerinde puanlama bölümü hiç render edilmiyor.
- **Dosyalar:** `src/services/ratingService.js`, `src/components/movies/RatingStars.jsx`, `MovieDetailsPage.jsx`, `movies.js` (`rating` alanı eklendi).
- **Testler:** 8 birim testi (ratingService), 2 entegrasyon testi.
- **Self-review'da bulunan ve düzeltilen 2 sorun:** (1) Yıldızlar `role="radiogroup"` içindeydi ama `<button>` çocukları `role="radio"` değildi — geçersiz ARIA kombinasyonu, kaldırıldı. (2) Ziyaretçi için de hover önizlemesi (dolu yıldız efekti) çalışıyordu, tıklanamayacak bir etkileşim izlenimi veriyordu — `role === "member"` koşuluna bağlandı.

**6. 1.3.10 Yorum formu + kısıtlar** — REQ-11.1 · ✅
`commentService.js` (10-500 karakter, yasaklı kelime listesi, localStorage) + `CommentForm.jsx`. Ziyaretçiye form yerine "Yorum yapmak için giriş yapın." mesajı — form hiç render edilmiyor (koşulla gizlemek değil, DOM'da hiç yok). Canlı karakter sayacı kırmızıya döner, gönder butonu kısıtlar sağlanmadan hiç etkinleşmez.
- **Dosyalar:** `src/services/commentService.js`, `src/data/comments.js` (mock veri), `src/components/movies/CommentForm.jsx`, `src/services/errors.js` (`ValidationError`/`ForbiddenError` eklendi).
- **Testler:** 12 birim testi (commentService).

**7. 1.3.11 Yorum listeleme + sıralama** — REQ-11 · ✅
`CommentList.jsx` — mock (`seed-` önekli) + kullanıcı (`comment-` önekli) yorumları birlikte, tarihe göre yeniden eskiye sıralı. Yalnız kendi (`comment-` önekli, seed olmayan) yorumunu düzenleyebilir/silebilir — seed yorumlar kimseye ait olmadığı için (demo/geçmiş veri) düzenlenemez.
- **Dosyalar:** `src/components/movies/CommentList.jsx`, `MovieDetailsPage.jsx`.
- **Testler:** 6 entegrasyon testi (boş durum, seed listeleme, kısa yorum reddi, gönderim, kendi/başkasının yorumu ayrımı, silme).

> **🔍 Review sonucu (backlog bitince):** Sıralama+filtre birlikte doğru çalışıyor (test edildi) · fragman fallback'i gerçekten test edildi (buton pasif + modal aç/kapat) · yorum kısıtları ziyaretçi/üye ayrımında sızıntı yok (form DOM'da hiç yok, servis katmanı da ayrıca doğruluyor) · **2 gerçek self-review bulgusu** (ARIA `radiogroup` hatası, ziyaretçi hover sızıntısı) düzeltildi · admin formundan eklenen filmlerde `rating`/`fragmanYoutubeId` alanları olmasa bile kod hiçbir yerde çökmüyor (`?? `/`?.` ile güvenli varsayılanlar, ayrıca doğrulandı).

#### 👤 Alptuğ — Entegrasyon & Destek

Kendi modülünde kalan görev yok. Bu backlog boyunca:
- Diğer üçünün PR'larına review desteği verebilir.
- `docs/SPRINT1_REVIEW.md`'de kendi modülüyle ilgili henüz kapanmamış maddeler varsa (ör. O1 — sinema kartındaki işlevsiz "Seansları Gör" butonu) bunları ele alabilir.
- Sprint 3 backlog'ları bitince yapılacak uçtan uca entegrasyon testine (bkz. aşağıdaki "Kapanış" notu) katkı verir.

---

### 🏁 Kapanış — Sprint 3 backlog'ları bitince

Eski planın Sprint 9'unda tarif edilen kapanış işi hâlâ geçerli, sadece artık "3 backlog'un tamamı bitince" tetikleniyor:

**Entegrasyon & UAT (Kaan + Alptuğ + gerekirse tüm ekip):** Uçtan uca akış testi (film → koltuk → bilet tipi → ödeme → başarı → profil), admin ↔ satış istatistik tutarlılığı, kalan bug-fix, `docs/cineseat_projeanaliz` REQ listesine karşı final kontrol.

> **🔍 Final code review:** Tam regresyon (`npm run test:run` + `npm run lint` + `npm run build`) · tüm REQ'ler karşılandı mı checklist · §8'deki teknik borcun tamamı kapandı mı.

---

## 6. Tek-Sprint Yürütme Sırası — güncel durum

**Kaan'ın backlog'u, Berke'nin 1.2.10'u ve Berke'nin kalan 6 görevi (1.3.3/1.3.4/1.3.8/1.3.9/1.3.10/1.3.11) artık bitti.** Geriye sadece Ömer kaldı:

- **Ömer'in 7 görevi tamamen bağımsız.** 1.2.6'yı bekleten Kaan'ın 1.4.8'i main'de — Ömer kendi backlog'unu tek oturumda, dış engel olmadan bitirebilir.
- **Alptuğ'un görevi yok** — kendi modülü + Kaan'ın modülü bitti, review/entegrasyon desteği veriyor.
- **Berke'nin modülü tamamen bitti** — 9/9 görev.

Tek açık koordinasyon konusu artık ileriye dönük değil, **geriye dönük**: Kaan'ın backlog'undaki 1.4.7 ve 1.4.9'da kalan 2 boşluk (§8) sahiplenilmeli.

---

## 7. Bağımlılık Haritası (kritik zincirler — sprint sınırı olmasa da hâlâ geçerli)

- **Auth zinciri (Ömer):** 1.2.3 ✅ → 1.2.1 ✅ → 1.2.2 → 1.2.4 → (1.2.5 → 1.2.7 → 1.2.8) → 1.5.9 → 1.2.6 (artık serbest, ✅ Kaan'ın 1.4.8'i bitti).
- **Ödeme zinciri (Kaan):** 1.4.3 ✅ → 1.4.4 ✅ → 1.4.5 ✅ → 1.4.8 ✅ → 1.4.7 🟡 → 1.4.9 🟡 → 1.2.9 ✅ — hepsi main'de, 1.4.7/1.4.9'daki boşluklar §8'de.
- **Admin (Alptuğ):** 1.5.1 → 1.5.2 → 1.5.3 → 1.5.4 → 1.5.5 → 1.5.6 — hepsi ✅.
- **Katalog (Berke):** 1.3.1 ✅ → 1.3.5 ✅ → 1.3.6 ✅ → 1.3.3 ✅ → 1.3.4 ✅; sosyal 1.3.8 ✅ → 1.3.9 ✅ → 1.3.10 ✅ → 1.3.11 ✅; 1.2.10 ✅ — **modül tamamen bitti.**
- **Kaan → Berke köprüsü:** ✅ **Kapandı** — Kaan'ın 1.4.5'i bitti, Berke'nin 1.2.10'u tamamlandı.
- **Kaan → Ömer köprüsü:** ✅ **Kapandı** — Kaan'ın 1.4.8'i bitti, Ömer'in 1.2.6'sı artık gerçek rezervasyon verisiyle test edilebilir.

## 8. Teknik Borç (kapanana kadar takip edilir)

- ✅ `seatService` güvensiz `JSON.parse` → Kaan tarafından 1.4.3'te düzeltildi.
- ✅ Kök dizindeki gereksiz `tatus` dosyası → silindi.
- ✅ Case-sensitivity build hatası, `/admin` koruması yokluğu, sahte admin istatistikleri → Sprint 1 review sonrası düzeltildi (`SPRINT1_REVIEW.md`).
- ✅ `LoginPage`/`RegisterPage`'te render sırasında `navigate()` çağrısı (React Router anti-pattern) → Sprint 2 review sonrası `useEffect`'e taşınarak düzeltildi.
- ✅ Rezervasyon no `CS-…` → `RES-#####` (REQ-22) → 1.4.8 kapsamında düzeltildi.
- ✅ Rezervasyon atomikliği (çoklu seanslı sepette kısmi hata durumunda kısmi yazım) → **çözüldü**: `seatService.reserveAllSeats` artık önce tüm oturum/koltuk çiftlerini doğruluyor, sonra hepsini yazıyor (kısmi yazım riski kalmadı).
- ⬜ **Koltuk kilidi (`GECICI_KILITLI`) sahiplik/token kontrolü hâlâ yok** (`SPRINT1_REVIEW.md` Y3) — 1.4.7 tamamlandı işaretlendi ama bu kısım atlanmış, uyarı yorumu kodda hâlâ duruyor. **Sahibi yok, açık.**
- ⬜ **1.4.9'da ödeme başarısız olunca koltuklar hemen serbest kalıyor** — spesifikasyon "kilitli kalır, sayaç devam eder" diyordu, `PaymentPage`'in unmount cleanup'ı `/odeme-hata`'ya geçişte kilitleri anında açıyor. **Sahibi yok, açık.**
- ⬜ 1.2.9 ziyaretçi formunda Ad-Soyad için REQ-03'ün istediği 2–50 karakter doğrulaması yok (sadece `required`) — düşük öncelik, sahibi yok.
- ⬜ Sinema kartındaki "Seansları Gör" butonu işlevsiz (sinema↔seans veri ilişkisi hiç modellenmemiş) → sahibi yok, Alptuğ üstlenebilir (`SPRINT1_REVIEW.md` O1).
