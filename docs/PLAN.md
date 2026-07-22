# CineSeat Faz-1 — Sprint Planı ve Görev Dağılımı

**Proje:** CineSeat (React + Vite, mock veri, frontend)
**Ekip:** Kaan Sezer · Alptuğ Dursun · Ömer Faruk Çendek · İzzettin Berke Kuş
**Kaynak:** `docs/Work breakdown structure.png`, `docs/cineseat_projeanaliz (4).pdf` (REQ-01…REQ-27), `docs/WBS_GOREV_DAGILIMI.md`

---

## 1. Genel Bakış

WBS'teki 44 görevin **10'u** plan yazıldığında zaten tamamlanmıştı. Kalan 34 görev başlangıçta 4 kişiye dengeli dağıtılıp **9 sprinte** (kişi başı 1 task/sprint, sprint sonu review) bölünmüştü.

**Güncel durum (bu revizyon anında):** Sprint 1 ve Sprint 2'nin tamamı, Berke'nin Sprint 3 backlog'undan 1.3.6 da bitti — **25 görev tamamlanmış, 19 görev kalmış.** Alptuğ kendi modülünün tamamını (8 görev) Sprint 1'de tek seferde bitirdiği için planın "kişi başı sprintte 1 task" modeli fiilen bozuldu; ekip de pratikte "her kişi kendi sıradaki backlog'unu kendi hızında bitiriyor, review iş bitince yapılıyor" şeklinde çalışmaya başladı.

**Bu revizyonla değişen şey:** Kaan, Ömer ve Berke'nin eskiden **S3'ten S9'a kadar tek tek dağıtılmış** kalan görevleri artık **tek bir "Sprint 3" (konsolide backlog)** altında toplandı. Sprint sınırları arasındaki zorunlu bekleme kaldırıldı; kişi içi görev **sırası** (bağımlılık zinciri) korundu — sadece "her görev ayrı bir sprint" kısıtı kaldırıldı. Review hâlâ yapılır, ama artık sprint sonunda değil, **her kişi kendi konsolide backlog'unu bitirdiğinde** (ya da makul bir ara noktada) yapılır.

### Kişi başı durum (bu revizyon anında)
| Kişi | Sahip olduğu modül | Toplam görev | Bitmiş | Kalan (→ tek "Sprint 3"e toplandı) |
|------|--------------------|:---:|:---:|:---:|
| **Alptuğ Dursun** | Yönetici Paneli, Lokasyon | 8 | **8** | **0 — modül tamamen bitti** |
| **Kaan Sezer** | Rezervasyon, Ödeme, Kampanya | 8 | 2 (S1: 1.4.3, S2: 1.4.4) | 5 |
| **Ömer Faruk Çendek** | Kimlik, Profil, Favoriler, Tema | 9 | 2 (S1: 1.2.3, S2: 1.2.1) | 7 |
| **İzzettin Berke Kuş** | Katalog, Detay, Sosyal (yorum/puan) | 9 | 3 (S1: 1.3.1, S2: 1.3.5, S3: 1.3.6) | 7 |

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
| 1.4.10 | Başarı ekranı + rezervasyon no (temel, **format hâlâ düzeltilmeli** — bkz. §8) | — | ✅ |
| 1.2.3 | Auth context ve oturum yönetimi (REQ-21) | S1 | ✅ `AuthContext`/`AuthProvider`/`useAuth` |
| 1.4.3 | Koltuk state makinesi: 4 durum (REQ-01) | S1 | ✅ `domain/seatStatus.js` |
| 1.5.1–1.5.8 | Admin panel + film CRUD + istatistik/rapor/CSV + sinemalar + geolocation | S1 | ✅ Alptuğ tek seferde bitirdi |
| 1.2.1 | Login / register sayfaları (REQ-16, REQ-21) | S2 | ✅ `LoginPage.jsx`/`RegisterPage.jsx` |
| 1.4.4 | Sepet yapısı + bilet tipi seçimi (REQ-02) | S2 | ✅ `domain/ticketType.js` |
| 1.3.1 | Vizyonda / Yakında sekme yapısı (REQ-08) | S2 (aslında S1'de bitmişti) | ✅ `HomePage.jsx` sekmeleri |
| 1.3.5 | Otomatik kategorizasyon ve arşiv (REQ-05) | S2 | ✅ `movieService.isMovieArchived` |
| 1.3.6 | Yakında 6 ay zaman kısıtı (REQ-15) | S3 | ✅ `movieService.isWithinComingSoonWindow` |

> **Dikkat — "bitti" ama düzeltme gerektiren yerler:**
> - 1.4.10 rezervasyon no formatı `CS-…`, doküman `RES-#####` istiyor (REQ-22) → Kaan, Sprint 3 backlog'undaki 1.4.8 kapsamında düzeltecek.
> - Sprint 1–2'de bulunan kritik/yüksek öncelikli bulgular (case-sensitivity build hatası, `/admin` koruması, sahte admin istatistikleri, render-body'de `navigate()` çağrısı vb.) çoğunlukla düzeltildi — tam liste ve kalanlar `docs/SPRINT1_REVIEW.md`'de.

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
| **S3** 🔵 (yeni, konsolide) | 1.2.2, 1.2.4, 1.2.5, 1.2.7, 1.2.8, 1.5.9, 1.2.6 — **7 görev, tek backlog (son madde Kaan'ı bekler)** | 1.4.5, 1.4.8, 1.4.7, 1.4.9, 1.2.9 — **5 görev, tek backlog (dış bağımlılığı yok)** | *(kalan görevi yok — entegrasyon/review desteği)* | ~~1.3.6~~ ✅, 1.3.3, 1.3.4, 1.3.8, 1.3.9, 1.3.10, 1.3.11, 1.2.10 — **8 görev, tek backlog (1/8 bitti, son madde Kaan'ı bekler)** |

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

#### 👤 Kaan — Rezervasyon & Ödeme (5 görev, sırayla)

**1. 1.4.5 Dinamik fiyat: çarpan + ara toplam** — REQ-02
Bilet tipi çarpanları (Yetişkin ×1.00 / Öğrenci ×0.75 / Çocuk ×0.60) ile ara toplam; TRY, XXX,XX formatı, 2 ondalık yuvarlama. **`calcSubtotal(items)` imzasını paylaş** (bkz. §3.6 — Berke'nin 1.2.10'u buna bağımlı).
- **Kabul:** Sepet toplamı tipe göre doğru; format ve yuvarlama REQ-02 ile uyumlu.
- **Dosyalar:** `src/services/pricing.js`, `CartPage`, `reservationService`.
- **Bağımlılık:** 1.4.4 ✅.

**2. 1.4.8 Ödeme simülasyon ekranı** — REQ-26
Kart sahibi adı, kart numarası, son kullanma (AA/YY), CVV formlu ödeme ekranı + rota. Doğrulama tamamen ön yüzde; hiçbir veri saklanmaz/gönderilmez. Başarıda rezervasyon no `RES-#####` üretimi (REQ-22, benzersizlik kontrolü — mevcut `CS-…` düzeltilir).
- **Kabul:** `/odeme` ekranı; kart alanları format doğrulaması; başarıda `RES-#####` üretir ve başarı ekranına taşır.
- **Dosyalar:** `src/pages/PaymentPage.jsx`, `src/services/reservationService.js`, `src/App.jsx`, `SuccessPage`.
- **Bağımlılık:** 1.4.5 (bu backlog'ta madde 1).

**3. 1.4.7 Geçici koltuk kilidi + 3 dk sayaç** — REQ-19
Ödeme/onaya geçişte koltukları `GECICI_KILITLI` yap, 3 dk geri sayım göster. Süre biterse/sayfa terk edilirse sepet boşalır, koltuklar `BOS`. **Not:** `seatService.lockSeats`/`releaseLockedSeats` zaten hazır (Sprint 1), ama kilit-sahiplik/token kontrolü yok — bkz. `SPRINT1_REVIEW.md` Y3, bu görev başlamadan önce mutlaka okunmalı (aksi halde iki kullanıcı aynı koltuğu ödeme sırasında alabilir).
- **Kabul:** Sayaç görünür; süre bitince koltuklar serbest + kullanıcı koltuk ekranına döner; kilit-çakışma kontrolü eklenir.
- **Dosyalar:** `src/pages/PaymentPage.jsx`, `src/hooks/useCountdown.js`, `seatService`.
- **Bağımlılık:** 1.4.3 ✅, 1.4.8 (madde 2).

**4. 1.4.9 Ödeme başarısızlık ekranı** — REQ-13
Test kartı ile tetiklenen başarısızlık: hata ekranı + neden + "Tekrar Dene" / "Sepete Dön". Başarısızlıkta koltuklar `GECICI_KILITLI` kalır, sayaç devam eder.
- **Kabul:** Test kartı başarısızlık üretir; akış askıda kalmaz; sayaç bitince koltuk `BOS`.
- **Dosyalar:** `PaymentPage.jsx`, `src/pages/PaymentErrorPage.jsx`.
- **Bağımlılık:** 1.4.7 (madde 3), 1.4.8 (madde 2).

**5. 1.2.9 Ziyaretçi bilgi formu** — REQ-03
Ödeme aşamasında ziyaretçiden Ad, Soyad, E-posta (Ad-Soyad 2–50) zorunlu; rezervasyon kaydına yazılır, başarı ekranında gösterilir.
- **Kabul:** Zorunlu alan doğrulaması; bilgiler rezervasyona işlenir.
- **Dosyalar:** `PaymentPage.jsx`, `reservationService`.
- **Bağımlılık:** 1.4.8 (madde 2).

> **🔍 Review odağı (Kaan backlog'u bitince):** Fiyat yuvarlama/format doğruluğu · ödeme verisinin hiçbir yere yazılmadığı · kilit-çakışma kontrolü gerçekten eklendi mi (Y3) · sayaç zaman aşımında `clearInterval`/memory leak yok mu · rezervasyon no formatı gerçekten `RES-#####`'e döndü mü (REQ-22).

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

#### 👤 Berke — Katalog, Detay & Sosyal (8 görev, sırayla)

**1. 1.3.6 Yakında 6 ay zaman kısıtı** — REQ-15 · ✅ **Tamamlandı**
"Yakında" listesini bugünden itibaren en fazla 6 ay içinde vizyona girecek filmlerle sınırla.
- **Kabul:** 6 aydan uzak filmler ana sayfada yok, sistemde/adminde kayıtlı.
- **Dosyalar:** `src/services/movieService.js` (`isWithinComingSoonWindow`), `HomePage.jsx`.
- **Bağımlılık:** 1.3.1 ✅, 1.3.5 ✅.

**2. 1.3.3 Sıralama modülü (tarih/puan)** — REQ-08.1
"Vizyonda" filmlerini vizyon tarihi (yeni/eski) ve kullanıcı puanı (yüksek/düşük) ile sırala. Varsayılan: tarih, yeniden eskiye.
- **Kabul:** Sıralama seçenekleri çalışır; varsayılan doğru.
- **Dosyalar:** `src/components/movies/SortControl.jsx`, `HomePage`.
- **Bağımlılık:** 1.3.1 ✅.

**3. 1.3.4 Filtreleme modülü (tür/yaş)** — REQ-08.1
Tür ve izleyici kısıtına göre filtre; sıralamayla birlikte çalışır; boş sonuç → empty state.
- **Kabul:** Filtre + sıralama birlikte; boş durumda mesaj.
- **Dosyalar:** `src/components/movies/FilterControl.jsx`, `HomePage`.
- **Bağımlılık:** 1.3.3 (madde 2).

**4. 1.3.8 Fragman modalı + fallback** — REQ-09, REQ-09.1
"Fragman İzle" → modal içinde YouTube iframe. `fragmanYoutubeId` yoksa buton pasif; iframe yüklenemezse fallback mesajı + YouTube linki.
- **Kabul:** Modal sayfa yenilemeden açılır; fallback davranışları çalışır.
- **Dosyalar:** `src/components/movies/TrailerModal.jsx`, `MovieDetailsPage.jsx`, `movies.js`.
- **Bağımlılık:** 1.3.7 ✅.

**5. 1.3.9 Puanlama 1-5 yıldız** — REQ-11
Üye, "Vizyonda" film detayında 1-5 yıldız puan verebilir; ortalama puan güncellenir.
- **Kabul:** Yalnız üye puanlar; ortalama/oy sayısı güncel.
- **Dosyalar:** `src/components/movies/RatingStars.jsx`, `MovieDetailsPage.jsx`.
- **Bağımlılık:** 1.2.3 ✅ (üye girişi).

**6. 1.3.10 Yorum formu + kısıtlar** — REQ-11.1
Üye yorum formu: 10–500 karakter, canlı sayaç, yasaklı kelime kontrolü; ziyaretçiye "Yorum yapmak için giriş yapın". Üye kendi yorumunu düzenler/siler.
- **Kabul:** Kısıtlar birebir; ziyaretçiye form hiçbir koşulda etkin değil.
- **Dosyalar:** `src/components/movies/CommentForm.jsx`, `MovieDetailsPage.jsx`.
- **Bağımlılık:** 1.2.3 ✅, 1.3.9 (madde 5).

**7. 1.3.11 Yorum listeleme + sıralama** — REQ-11
Film detayında mock + kullanıcı yorumlarını listele, tarihe göre sırala.
- **Kabul:** Yorumlar listelenir/sıralanır; boş durumda mesaj.
- **Dosyalar:** `src/components/movies/CommentList.jsx`, `MovieDetailsPage.jsx`.
- **Bağımlılık:** 1.3.10 (madde 6).

**8. 1.2.10 Kampanya + indirim motoru** — REQ-10
Üye sepet aşamasında, state'teki aktif kampanyalara göre ara toplam üzerine indirim. Kaan'ın `calcSubtotal` çıktısının üzerine uygulanır.
- **Kabul:** Üyeye indirim yansır; ziyaretçiye yansımaz; sıralı uygulama.
- **Dosyalar:** `src/services/campaignService.js`, `CartPage.jsx`, `pricing.js`.
- **Bağımlılık:** **Kaan'ın 1.4.5'i** (fiyat sözleşmesi — bkz. §3.6, Kaan'ın backlog'unda madde 1), 1.2.3 ✅ (üye). Bu yüzden bu görev, listedeki en son madde olarak sıralandı — Kaan'ın 1.4.5'i bitmeden başlanamaz.

> **🔍 Review odağı (Berke backlog'u bitince):** Sıralama+filtre birlikte doğru çalışıyor mu · fragman fallback'i gerçekten test edildi mi (bozuk id, iframe engeli) · yorum kısıtları ziyaretçi/üye ayrımında sızıntı var mı · kampanya indirimi Kaan'ın ara toplam sözleşmesiyle gerçekten uyumlu mu.

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

## 6. Tek-Sprint Yürütme Sırası — herkes kendi backlog'unu tek prompt'ta bitirebilsin

Amaç: her kişi, kendi konsolide backlog'unu **tek bir kesintisiz oturumda** (tek prompt) baştan sona bitirebilsin — bir başkasının işini bekleyip ortada duraklamasın. Bunun için tüm 19 kalan görevin bağımlılıkları tek tek tarandı (§5'teki her "Bağımlılık" satırı); sonuç:

- **Kaan'ın 5 görevi tamamen bağımsız.** Hiçbiri Ömer'e veya Berke'ye bağlı değil — Kaan işe hemen, hiçbir şeyi beklemeden başlayabilir ve tüm backlog'unu tek oturumda bitirebilir.
- **Ömer'in 7 görevinden 6'sı tamamen bağımsız** (1.2.2, 1.2.4, 1.2.5, 1.2.7, 1.2.8, 1.5.9) — hepsi ya zaten ✅ biten görevlere ya da kendi listesindeki önceki maddeye bağlı. **Yalnızca son madde (1.2.6)** Kaan'ın 2. maddesini (1.4.8) bekliyor; bu yüzden bilinçli olarak listenin **en sonuna** alındı.
- **Berke'nin kalan 7 görevinden 6'sı tamamen bağımsız** (1.3.3, 1.3.4, 1.3.8, 1.3.9, 1.3.10, 1.3.11) — hepsi ya ✅ biten görevlere ya da kendi listesindeki önceki maddeye bağlı. **Yalnızca son madde (1.2.10)** Kaan'ın 1. maddesini (1.4.5) bekliyor; zaten listenin **en sonunda**.
- **Alptuğ'un görevi yok** — dış bağımlılığı yok, hazır bulunduğunda review/entegrasyon desteği verir.

**Pratik sonuç:** Üç backlog da **paralel başlayabilir.** Kaan'ın kendi 5 maddelik listesindeki ilk iki madde (1.4.5, 1.4.8) hem Ömer'in hem Berke'nin tek engelini oluşturuyor — ve bu iki madde Kaan'ın *kendi* sırasının en başında olduğu için, Kaan backlog'una başladıktan kısa süre sonra iki köprü de kapanmış olur. Ömer ve Berke bu sırada kendi 6'şar bağımsız görevlerini tek prompt'ta bitirip en sona geldiklerinde, Kaan'ın 1.4.5/1.4.8'i normal şartlarda çoktan bitmiş olur. Tek gerçek koordinasyon noktası: **Kaan, 1.4.5'te `calcSubtotal(items)` imzasını netleştirip paylaşsın (§3.6) ki Berke 1.2.10'u o sözleşmeye göre yazsın — tahminle yazıp rework riskine girmesin.**

Eğer Kaan beklenenden yavaş kalırsa: Ömer/Berke'nin backlog'unun geri kalanı (6/7 görev) bundan hiç etkilenmez, sadece o kişinin **son maddesi** bir sonraki oturuma kalır — tüm backlog'u durdurmaz.

---

## 7. Bağımlılık Haritası (kritik zincirler — sprint sınırı olmasa da hâlâ geçerli)

- **Auth zinciri (Ömer):** 1.2.3 ✅ → 1.2.1 ✅ → 1.2.2 → 1.2.4 → (1.2.5 → 1.2.7 → 1.2.8) → 1.5.9 → 1.2.6 (en sonda, dış bağımlılık).
- **Ödeme zinciri (Kaan):** 1.4.3 ✅ → 1.4.4 ✅ → 1.4.5 → 1.4.8 → 1.4.7 → 1.4.9 → 1.2.9.
- **Admin (Alptuğ):** 1.5.1 → 1.5.2 → 1.5.3 → 1.5.4 → 1.5.5 → 1.5.6 — hepsi ✅.
- **Katalog (Berke):** 1.3.1 ✅ → 1.3.5 ✅ → 1.3.6 ✅ → 1.3.3 → 1.3.4; sosyal 1.3.8 → 1.3.9 → 1.3.10 → 1.3.11 (auth'a bağlı, ✅) → 1.2.10 (en sonda, dış bağımlılık: Kaan'ın 1.4.5'i).
- **Kaan → Berke köprüsü:** Berke'nin 1.2.10'u (kendi backlog'unun son maddesi) Kaan'ın 1.4.5'i (Kaan'ın backlog'undaki **1. madde**) bitmeden başlayamaz.
- **Kaan → Ömer köprüsü:** Ömer'in 1.2.6'sı (bilet sekmeleri, en son maddeye alındı) Kaan'ın 1.4.8'i (Kaan'ın backlog'undaki **2. madde**, gerçek rezervasyon verisi üretir) bitmeden anlamlı test edilemez.
- **Sonuç:** Kaan'ın kendi backlog'undaki **ilk iki madde** (1.4.5, 1.4.8) hem Berke'yi hem Ömer'i besliyor. İkisi de Kaan'ın 5 maddelik listesinin en başında olduğu için, Kaan işe başladıktan kısa süre sonra her iki köprü de açılır — bkz. aşağıdaki "Tek-Sprint Yürütme Sırası".

## 8. Teknik Borç (kapanana kadar takip edilir)

- ✅ `seatService` güvensiz `JSON.parse` → Kaan tarafından 1.4.3'te düzeltildi.
- ✅ Kök dizindeki gereksiz `tatus` dosyası → silindi.
- ✅ Case-sensitivity build hatası, `/admin` koruması yokluğu, sahte admin istatistikleri → Sprint 1 review sonrası düzeltildi (`SPRINT1_REVIEW.md`).
- ✅ `LoginPage`/`RegisterPage`'te render sırasında `navigate()` çağrısı (React Router anti-pattern) → Sprint 2 review sonrası `useEffect`'e taşınarak düzeltildi.
- ⬜ Rezervasyon no `CS-…` → `RES-#####` (REQ-22) → **Kaan'ın Sprint 3 backlog'u, madde 2 (1.4.8)**.
- ⬜ Rezervasyon atomik değil (çoklu seanslı sepette kısmi hata durumunda kısmi yazım) → backend olmadan tam çözülemiyor, `SPRINT1_REVIEW.md` O5'te not edildi; Kaan'ın Sprint 3 backlog'unda ödeme akışı elden geçerken tekrar değerlendirilebilir.
- ⬜ Koltuk kilidi (`GECICI_KILITLI`) sahiplik/token kontrolü yok → **Kaan'ın Sprint 3 backlog'u, madde 3 (1.4.7) başlamadan önce mutlaka ele alınmalı** (`SPRINT1_REVIEW.md` Y3).
- ⬜ Sinema kartındaki "Seansları Gör" butonu işlevsiz (sinema↔seans veri ilişkisi hiç modellenmemiş) → sahibi yok, Alptuğ üstlenebilir (`SPRINT1_REVIEW.md` O1).
