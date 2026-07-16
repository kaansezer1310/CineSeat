# CineSeat Faz-1 — Sprint Planı ve Görev Dağılımı

**Proje:** CineSeat (React + Vite, mock veri, frontend)
**Ekip:** Kaan Sezer · Alptuğ Dursun · Ömer Faruk Çendek · İzzettin Berke Kuş
**Kaynak:** `docs/Work breakdown structure.png`, `docs/cineseat_projeanaliz (4).pdf` (REQ-01…REQ-27), `docs/WBS_GOREV_DAGILIMI.md`

---

## 1. Genel Bakış

WBS'teki 44 görevin **10'u mevcut kodda tamamlandı**, **34'ü kalan iş**. Kalan 34 görev 4 kişiye dengeli dağıtıldı ve **9 sprinte** bölündü.

- **Her sprintte 4 task** (kişi başı 1 task).
- **Her sprint sonunda code review** yapılır; bulgular kapatılmadan bir sonraki sprinte geçilmez.
- Görev sıralaması **bağımlılıklara** göre dizildi (önce çekirdek altyapı, sonra ona bağlı ekranlar).

### Kişi başı toplam görev
| Kişi | Sahip olduğu modül | Toplam görev |
|------|--------------------|:---:|
| **Ömer Faruk Çendek** | Kimlik, Profil, Favoriler, Tema | 9 |
| **İzzettin Berke Kuş** | Katalog, Detay, Sosyal (yorum/puan) | 9 |
| **Kaan Sezer** | Rezervasyon, Ödeme, Kampanya | 8 |
| **Alptuğ Dursun** | Yönetici Paneli, Lokasyon | 8 |

> Sprint 1–8 dolu (4 task). Sprint 9'da 2 gerçek task kalır (Ömer + Berke); Kaan ve Alptuğ bu sprintte **entegrasyon + UAT + bug-fix** desteği verir.

---

## 2. Zaten Tamamlanmış Görevler (tekrar yapılmayacak)

| # | Görev | Durum |
|---|-------|-------|
| 1.1.1–1.1.4 | Tüm proje altyapısı (Vite, git, klasör, mock servis katmanı) | ✅ |
| 1.3.2 | Film kartı bileşeni | ✅ |
| 1.3.7 | Film detay sayfası (temel) | ✅ |
| 1.4.1 | Seans ve salon seçim ekranı | ✅ |
| 1.4.2 | Koltuk grid bileşeni | ✅ |
| 1.4.6 | Sepet işlemleri (kaldır / boşalt / geri) | ✅ |
| 1.4.10 | Başarı ekranı + rezervasyon no (temel) | ✅ |

> **Dikkat — "bitti" ama düzeltme gerektiren yerler:** 1.4.10 rezervasyon no formatı `CS-…`, doküman `RES-#####` istiyor (REQ-22) → Kaan ödeme akışında düzeltecek. Koltuk grid'i (1.4.2) var ama 4 durumlu state makinesi (1.4.3) yok → Kaan yapacak.

---

## 3. Çalışma Kuralları (herkes için ortak)

1. **Branch:** Her task için `feature/<wbs-no>-kisa-ad` (örn. `feature/1.2.3-auth-context`). `main`e doğrudan push yok.
2. **PR:** Task bitince PR açılır; sprint sonunda tüm PR'lara **code review** uygulanır.
3. **Code review komutu:** Her PR/branch için `/code-review` çalıştırılır. **Critical + Warning** bulguları kapatılmadan merge yok. Bulgular kapandıktan sonra `main`e merge.
4. **Servis katmanı sözleşmesi:** Yeni veri erişimleri `src/services/*` altında, mevcut `async fetchX()` desenine uygun yazılır (Kalite Niteliği: Maintainability).
5. **Tema tokenları (kritik ortak kural):** Sprint 1'den itibaren **herkes** renkleri doğrudan hex yazmaz; `src/index.css` içinde tanımlı CSS değişkenlerini (`var(--bg)`, `var(--text)` vb.) kullanır. Böylece Ömer'in S9'daki Light/Dark tema işi tüm ekranlara otomatik yansır, geri dönüş (rework) olmaz.
6. **Ara toplam sözleşmesi:** Kaan S3'te fiyat hesaplama fonksiyonunun imzasını (`calcSubtotal(items) -> number`) belirleyip paylaşır; kampanya indirimi (Kaan S8) bu çıktının üzerine uygulanır.
7. **Definition of Done (her task):** İlgili REQ karşılanır · boş/hata durumları (empty/error state) ele alınır · en az 1 birim testi (mümkünse) · lint temiz · responsive · tema tokenlarına uyumlu.

---

## 4. Sprint Özet Tablosu

| Sprint | Ömer (Kimlik/Profil) | Kaan (Rezervasyon/Ödeme) | Alptuğ (Admin/Lokasyon) | Berke (Katalog/Sosyal) |
|:---:|---|---|---|---|
| **S1** | 1.2.3 Auth context + oturum | 1.4.3 Koltuk 4 durum state makinesi | 1.5.7 Sinemalar sayfası + şehir dropdown | 1.3.1 Vizyonda/Yakında sekme |
| **S2** | 1.2.1 Login / register sayfaları | 1.4.4 Sepet + bilet tipi seçimi | 1.5.8 Geolocation + mesafe + fallback | 1.3.5 Otomatik kategorizasyon + arşiv |
| **S3** | 1.2.2 Form doğrulama + regex | 1.4.5 Çarpanlı fiyat + ara toplam | 1.5.1 Admin panel layout | 1.3.6 Yakında 6 ay zaman kısıtı |
| **S4** | 1.2.4 ProtectedRoute + rol | 1.4.8 Ödeme simülasyon ekranı | 1.5.2 Film ekle/sil/güncelle formu | 1.3.3 Sıralama (tarih/puan) |
| **S5** | 1.2.5 Profil sayfası | 1.4.7 Geçici kilit + 3 dk sayaç | 1.5.3 Form validasyon + silme onayı | 1.3.4 Filtreleme (tür/yaş) |
| **S6** | 1.2.6 Bilet sekmeleri (güncel/geçmiş) | 1.4.9 Ödeme başarısızlık ekranı | 1.5.4 İstatistik hesaplama | 1.3.8 Fragman modalı + fallback |
| **S7** | 1.2.7 İzleme listesi ikon + state | 1.2.9 Ziyaretçi bilgi formu | 1.5.5 Rapor tablo + grafik | 1.3.9 Puanlama 1-5 yıldız |
| **S8** | 1.2.8 İzleme listem sekmesi + bildirim | 1.2.10 Kampanya + indirim motoru | 1.5.6 CSV export + arşiv istatistik | 1.3.10 Yorum formu + kısıtlar |
| **S9** | 1.5.9 Light / dark mod | *(entegrasyon + UAT)* | *(entegrasyon + UAT)* | 1.3.11 Yorum listeleme + sıralama |

---

## 5. Sprint Detayları

Her task için: **Sahip · REQ · Ne yapılacak · Kabul kriterleri · Dosyalar · Bağımlılık.**

---

### 🟩 SPRINT 1 — Çekirdek altyapı

**1.2.3 Auth context ve oturum yönetimi** — *Ömer* · REQ-21
Mock kullanıcı dizisi üzerinden e-posta+şifre doğrulama, oturum (kullanıcı+rol) için `AuthContext` + `AuthProvider`, `useAuth` hook. Header'ın oturum durumuna göre değişmesi (Giriş/Kayıt ↔ Kullanıcı adı + Profilim + Çıkış). Çıkışta oturum + aktif sepet temizlenir.
- **Kabul:** `login(email,pw)` / `logout()` çalışır; hatalı girişte alan belirtmeyen genel hata; rol (`guest`/`member`/`admin`) context'ten okunabilir; sayfa yenilenene kadar oturum korunur.
- **Dosyalar:** `src/context/AuthContext.js`, `src/context/AuthProvider.jsx`, `src/hooks/useAuth.js`, `src/data/users.js`, `src/services/authService.js`, `src/components/layout/Layout.jsx`.
- **Bağımlılık:** Yok (çekirdek). **Diğer birçok task buna bağlı — S1'de bitmesi kritik.**

**1.4.3 Koltuk state makinesi: 4 durum** — *Kaan* · REQ-01
Koltuk durumunu BOS / SECILI / GECICI_KILITLI / DOLU olarak modelle. Geçişler: `BOS→SECILI→GECICI_KILITLI→DOLU`; geri dönüşler yalnız REQ-01'deki hâllerde. `GECICI_KILITLI` ve `DOLU` seçilemez, arayüzde ayrı renk.
- **Kabul:** Her 4 durum ayrı renkle gösterilir; geçici kilitli/dolu koltuk tıklanamaz; mevcut `seatService` bu duruma göre refactor edilir (güvensiz `JSON.parse` de düzeltilir).
- **Dosyalar:** `src/services/seatService.js`, `src/components/seats/Seat.jsx`, `src/components/seats/SeatMap.jsx`, `src/pages/BookingPage.jsx`.
- **Bağımlılık:** Yok (booking akışının temeli). S5'teki sayaç (1.4.7) bunun üzerine kurulur.

**1.5.7 Sinemalar sayfası ve şehir dropdown** — *Alptuğ* · REQ-07
Şehir/salon açılır menüsünden seçime göre sinemaları listeleyen "Sinemalar" sayfası ve rota. Mock sinema verisi (ad, şehir, konum, koordinat).
- **Kabul:** `/sinemalar` rotası; şehir seçince liste filtrelenir; boş sonuç için empty state.
- **Dosyalar:** `src/pages/CinemasPage.jsx`, `src/data/cinemas.js`, `src/services/cinemaService.js`, `src/App.jsx`.
- **Bağımlılık:** Yok (bağımsız modül).

**1.3.1 Vizyonda / Yakında sekme yapısı** — *Berke* · REQ-08
Ana sayfada "Vizyonda" ve "Yakında" iki sekme; geçiş sayfa yenilenmeden. "Yakında" kartlarında vizyon tarihi + vizyona kalan gün.
- **Kabul:** Sekme geçişi anlık; filmler `status`/vizyon tarihine göre doğru sekmede; "Yakında" kartında kalan gün sayısı.
- **Dosyalar:** `src/pages/HomePage.jsx`, `src/data/movies.js` (vizyon tarihi alanları eklenir), `src/components/movies/MovieCard.jsx`.
- **Bağımlılık:** Yok. S2 (kategorizasyon) ve S3 (6 ay kısıtı) bunu besler.

> **🔍 Sprint 1 code review:** 4 PR için `/code-review`. Özellikle `AuthContext` API'si ve koltuk state modeli — bunlar sonraki her şeyin temeli, burada dikkatli inceleme.

---

### 🟩 SPRINT 2 — Giriş, bilet tipi, konum, kategorizasyon

**1.2.1 Login / register sayfaları** — *Ömer* · REQ-16, REQ-21
Giriş ve kayıt formu ekranları + rotaları. Kayıt: Ad, Soyad, E-posta, Kullanıcı Adı, Şifre, Şifre(Tekrar) zorunlu; Telefon, Cinsiyet opsiyonel.
- **Kabul:** `/login`, `/register` rotaları; başarılı giriş header'ı günceller; e-posta ve kullanıcı adı benzersizlik kontrolü; şifre eşleşme kontrolü.
- **Dosyalar:** `src/pages/LoginPage.jsx`, `src/pages/RegisterPage.jsx`, `src/App.jsx`, `authService`.
- **Bağımlılık:** 1.2.3 (S1).

**1.4.4 Sepet yapısı + bilet tipi seçimi** — *Kaan* · REQ-02
Her koltuğa bilet tipi (Yetişkin / Öğrenci / Çocuk) atama; sepet modelini `{seatId, ticketType}` taşıyacak şekilde genişlet.
- **Kabul:** Sepette her koltuğun tipi seçilebilir/değiştirilebilir; farklı tipler bir arada; `cartReducer` yeni yapıya uyarlanır (testler güncellenir).
- **Dosyalar:** `src/context/cartReducer.js`, `src/pages/CartPage.jsx`, `src/pages/BookingPage.jsx`, ilgili testler.
- **Bağımlılık:** 1.4.3 (S1).

**1.5.8 Geolocation + mesafe + fallback** — *Alptuğ* · REQ-07, REQ-07.1
Tarayıcı konumuyla en yakın 5 sinema, Haversine mesafesine göre artan sırada (km, tek ondalık). İzin reddi/desteklenmeme/hata → şehir dropdown'ına düş + bilgilendirme.
- **Kabul:** Konum izniyle en yakın 5 sinema mesafeli listelenir; izin reddinde hata ile durmaz, "Konumunuza erişilemedi, lütfen şehir seçin" gösterir.
- **Dosyalar:** `src/pages/CinemasPage.jsx`, `src/services/cinemaService.js` (haversine util).
- **Bağımlılık:** 1.5.7 (S1).

**1.3.5 Otomatik kategorizasyon ve arşiv** — *Berke* · REQ-05
Vizyon tarihi geçmiş/kalkmış filmleri ana sayfa listesinden otomatik filtrele (arşivde/state'te kalır).
- **Kabul:** Süresi geçen filmler ana sayfada görünmez; veri silinmez.
- **Dosyalar:** `src/services/movieService.js`, `src/pages/HomePage.jsx`.
- **Bağımlılık:** 1.3.1 (S1).

> **🔍 Sprint 2 code review:** Sepet veri modeli değişikliği (`cartReducer`) — mevcut testlerin güncellendiğini doğrula.

---

### 🟩 SPRINT 3 — Doğrulama, fiyat, admin iskeleti, kısıtlar

**1.2.2 Form doğrulama kuralları + regex** — *Ömer* · REQ-16, REQ-17, Güvenlik 4.2
Kayıt/giriş validasyonları: kullanıcı adı 5–12, Türkçe/boşluk/özel karakter engeli (regex); şifre 6–15, en az bir harf+rakam+izinli özel karakter; ad-soyad 2–50.
- **Kabul:** Geçersiz girişte alan bazlı hata mesajı; regex kuralları REQ-17 ve 4.2 ile birebir; gönderim engellenir.
- **Dosyalar:** `src/services/validation.js`, `LoginPage`, `RegisterPage`.
- **Bağımlılık:** 1.2.1 (S2).

**1.4.5 Dinamik fiyat: çarpan + ara toplam** — *Kaan* · REQ-02
Bilet tipi çarpanları (Yetişkin ×1.00 / Öğrenci ×0.75 / Çocuk ×0.60) ile ara toplam; TRY, XXX,XX formatı, 2 ondalık yuvarlama. **`calcSubtotal(items)` imzasını paylaş.**
- **Kabul:** Sepet toplamı tipe göre doğru; format ve yuvarlama REQ-02 ile uyumlu.
- **Dosyalar:** `src/services/pricing.js`, `CartPage`, `reservationService`.
- **Bağımlılık:** 1.4.4 (S2).

**1.5.1 Admin panel layout** — *Alptuğ* · REQ-04, Güvenlik 4.2
Admin panel iskeleti ve `/admin` rotası; sekmeler (Filmler / Raporlar / Yorumlar). Rota, S4'te gelen rol kontrolüyle korunacak (şimdilik iskelet).
- **Kabul:** `/admin` layout + navigasyon; içerik alanları placeholder.
- **Dosyalar:** `src/pages/admin/AdminLayout.jsx`, `src/App.jsx`.
- **Bağımlılık:** Yok (koruma S4'te 1.2.4 ile entegre olur).

**1.3.6 Yakında 6 ay zaman kısıtı** — *Berke* · REQ-15
"Yakında" listesini bugünden itibaren en fazla 6 ay içinde vizyona girecek filmlerle sınırla.
- **Kabul:** 6 aydan uzak filmler ana sayfada yok, sistemde/adminde kayıtlı.
- **Dosyalar:** `src/services/movieService.js`, `HomePage`.
- **Bağımlılık:** 1.3.1, 1.3.5.

> **🔍 Sprint 3 code review:** Fiyat yuvarlama/format doğruluğu ve regex kuralları — test kaydırma (edge case) örnekleriyle incele.

---

### 🟩 SPRINT 4 — Erişim kontrolü, ödeme ekranı, film CRUD, sıralama

**1.2.4 ProtectedRoute + rol kontrolü** — *Ömer* · REQ-21, Güvenlik 4.2
Rol bazlı rota koruması. `/admin` yalnız `admin`; üye-only sayfalar (profil vb.) `member`. Yetkisiz erişim → yönlendirme.
- **Kabul:** URL'den `/admin`e yetkisiz erişim engellenir; korunan rotalar rolü kontrol eder.
- **Dosyalar:** `src/components/routing/ProtectedRoute.jsx`, `src/App.jsx`.
- **Bağımlılık:** 1.2.3. **Alptuğ'un admin rotasını (1.5.1) bu sprintte sarar — entegrasyon review'da doğrulanır.**

**1.4.8 Ödeme simülasyon ekranı** — *Kaan* · REQ-26
Kart sahibi adı, kart numarası, son kullanma (AA/YY), CVV formlu ödeme ekranı + rota. Doğrulama tamamen ön yüzde; hiçbir veri saklanmaz/gönderilmez. Başarıda rezervasyon no `RES-#####` üretimi (REQ-22, benzersizlik kontrolü — mevcut `CS-…` düzeltilir).
- **Kabul:** `/odeme` ekranı; kart alanları format doğrulaması; başarıda `RES-#####` üretir ve başarı ekranına taşır.
- **Dosyalar:** `src/pages/PaymentPage.jsx`, `src/services/reservationService.js`, `src/App.jsx`, `SuccessPage`.
- **Bağımlılık:** 1.4.5 (S3).

**1.5.2 Film ekle / sil / güncelle formu** — *Alptuğ* · REQ-04
Admin film yönetim formu: ad, afiş URL, açıklama, süre, tür, vizyon başlangıç/bitiş, yapımcı, oyuncular, fragman YouTube ID, izleyici kısıtı. Ekle/güncelle/sil.
- **Kabul:** CRUD çalışır; state güncellenir; liste anlık yansır.
- **Dosyalar:** `src/pages/admin/MovieForm.jsx`, `src/pages/admin/MovieManage.jsx`, `movieService`.
- **Bağımlılık:** 1.5.1; koruma için 1.2.4 (aynı sprint — entegrasyon review'da).

**1.3.3 Sıralama modülü (tarih/puan)** — *Berke* · REQ-08.1
"Vizyonda" filmlerini vizyon tarihi (yeni/eski) ve kullanıcı puanı (yüksek/düşük) ile sırala. Varsayılan: tarih, yeniden eskiye.
- **Kabul:** Sıralama seçenekleri çalışır; varsayılan doğru.
- **Dosyalar:** `src/components/movies/SortControl.jsx`, `HomePage`.
- **Bağımlılık:** 1.3.1.

> **🔍 Sprint 4 code review:** **Güvenlik odaklı** — `/admin` gerçekten korunuyor mu (URL denemesi)? Ödeme verisinin hiçbir yere yazılmadığı doğrulanır.

---

### 🟩 SPRINT 5 — Profil, geçici kilit+sayaç, silme onayı, filtre

**1.2.5 Profil sayfası** — *Ömer* · REQ-18
Üye profil sayfası: kişisel bilgileri görüntüle/güncelle formu.
- **Kabul:** `/profil` (korumalı); bilgiler düzenlenip kaydedilir.
- **Dosyalar:** `src/pages/ProfilePage.jsx`, `authService`.
- **Bağımlılık:** 1.2.4.

**1.4.7 Geçici koltuk kilidi + 3 dk sayaç** — *Kaan* · REQ-19
Ödeme/onaya geçişte koltukları `GECICI_KILITLI` yap, 3 dk geri sayım göster. Süre biterse/sayfa terk edilirse sepet boşalır, koltuklar `BOS`.
- **Kabul:** Sayaç görünür; süre bitince koltuklar serbest + kullanıcı koltuk ekranına döner.
- **Dosyalar:** `src/pages/PaymentPage.jsx`, `src/hooks/useCountdown.js`, `seatService`.
- **Bağımlılık:** 1.4.3, 1.4.8.

**1.5.3 Admin form validasyon + silme onayı** — *Alptuğ* · REQ-04
Film formu doğrulama (ad 2–100, açıklama 20–1000, bitiş>başlangıç, en az bir tür) + silmede onay modalı.
- **Kabul:** Kurallar birebir; silme onay modalı ile teyit.
- **Dosyalar:** `MovieForm.jsx`, `src/components/common/ConfirmModal.jsx`.
- **Bağımlılık:** 1.5.2.

**1.3.4 Filtreleme modülü (tür/yaş)** — *Berke* · REQ-08.1
Tür ve izleyici kısıtına göre filtre; sıralamayla birlikte çalışır; boş sonuç → empty state.
- **Kabul:** Filtre + sıralama birlikte; boş durumda mesaj.
- **Dosyalar:** `src/components/movies/FilterControl.jsx`, `HomePage`.
- **Bağımlılık:** 1.3.3.

> **🔍 Sprint 5 code review:** Sayaç zaman aşımı ve `GECICI_KILITLI→BOS` dönüşü — timer temizliği (memory leak / `clearInterval`) dikkatle.

---

### 🟩 SPRINT 6 — Bilet geçmişi, ödeme hatası, istatistik, fragman

**1.2.6 Bilet sekmeleri (Güncel / Geçmiş)** — *Ömer* · REQ-18
Profilde gösterim saati geçmemiş → "Güncel Biletler", geçmiş → "Geçmiş Biletler".
- **Kabul:** Rezervasyonlar tarihe göre doğru sekmede; rezervasyon no gösterilir.
- **Dosyalar:** `ProfilePage.jsx`, `reservationService`.
- **Bağımlılık:** 1.2.5, ödeme akışı (1.4.8).

**1.4.9 Ödeme başarısızlık ekranı** — *Kaan* · REQ-13
Test kartı (REQ-26) ile tetiklenen başarısızlık: hata ekranı + neden + "Tekrar Dene" / "Sepete Dön". Başarısızlıkta koltuklar `GECICI_KILITLI` kalır, sayaç devam eder.
- **Kabul:** Test kartı başarısızlık üretir; akış askıda kalmaz; sayaç bitince koltuk `BOS`.
- **Dosyalar:** `PaymentPage.jsx`, `src/pages/PaymentErrorPage.jsx`.
- **Bağımlılık:** 1.4.7, 1.4.8.

**1.5.4 İstatistik hesaplama fonksiyonları** — *Alptuğ* · REQ-06
Başarılı satışlardan toplam gelir, bilet tipi dağılımı, film bazlı doluluk oranı hesabı (oturum bazlı).
- **Kabul:** Hesap fonksiyonları doğru; satış oldukça state güncellenir.
- **Dosyalar:** `src/services/statsService.js`, admin rapor state.
- **Bağımlılık:** Ödeme akışı (1.4.8) veri üretiyor olmalı.

**1.3.8 Fragman modalı + fallback** — *Berke* · REQ-09, REQ-09.1
"Fragman İzle" → modal içinde YouTube iframe. `fragmanYoutubeId` yoksa buton pasif; iframe yüklenemezse "Fragman şu anda oynatılamıyor" + YouTube linki.
- **Kabul:** Modal sayfa yenilemeden açılır; fallback davranışları çalışır.
- **Dosyalar:** `src/components/movies/TrailerModal.jsx`, `MovieDetailsPage.jsx`, `movies.js`.
- **Bağımlılık:** 1.3.7 (mevcut).

> **🔍 Sprint 6 code review:** İstatistik hesabı ve ödeme-hata akışının koltuk durumuyla tutarlılığı.

---

### 🟩 SPRINT 7 — Favori ikonu, ziyaretçi formu, rapor görünümü, puanlama

**1.2.7 İzleme listesi ikonu + state** — *Ömer* · REQ-24
Kart ve detay sayfasında kalp/yer-imi ikonu; tıkla ekle/çıkar; dolu/boş görsel; anlık yansıma.
- **Kabul:** Favori state üyeye bağlı; anlık güncellenir.
- **Dosyalar:** `src/context/` (favori state veya `authService` içinde), `MovieCard.jsx`, `MovieDetailsPage.jsx`.
- **Bağımlılık:** 1.2.3.

**1.2.9 Ziyaretçi bilgi formu** — *Kaan* · REQ-03
Ödeme aşamasında ziyaretçiden Ad, Soyad, E-posta (Ad-Soyad 2–50) zorunlu; rezervasyon kaydına yazılır, başarı ekranında gösterilir.
- **Kabul:** Zorunlu alan doğrulaması; bilgiler rezervasyona işlenir.
- **Dosyalar:** `PaymentPage.jsx`, `reservationService`.
- **Bağımlılık:** 1.4.8.

**1.5.5 Rapor tablo + grafik görünümü** — *Alptuğ* · REQ-06
İstatistikleri admin panelinde tablo/grafik olarak göster.
- **Kabul:** Gelir, tip dağılımı, doluluk metin/grafik gösterilir.
- **Dosyalar:** `src/pages/admin/Reports.jsx`.
- **Bağımlılık:** 1.5.4.

**1.3.9 Puanlama 1-5 yıldız** — *Berke* · REQ-11
Üye, "Vizyonda" film detayında 1-5 yıldız puan verebilir; ortalama puan güncellenir.
- **Kabul:** Yalnız üye puanlar; ortalama/oy sayısı güncel.
- **Dosyalar:** `src/components/movies/RatingStars.jsx`, `MovieDetailsPage.jsx`.
- **Bağımlılık:** 1.2.3 (üye girişi).

> **🔍 Sprint 7 code review:** Favori ve puan state'inin üyeye doğru bağlandığı; ziyaretçi formu doğrulaması.

---

### 🟩 SPRINT 8 — Bildirim, kampanya, CSV, yorum formu

**1.2.8 İzleme listem sekmesi + bildirim** — *Ömer* · REQ-25
Profile "İzleme Listem" sekmesi (afiş, ad, vizyon tarihi, kalan gün, çıkar butonu). Favori film vizyona girince girişte "İzleme listenizdeki N film vizyonda!" kapatılabilir bant.
- **Kabul:** Sekme + bildirim bandı çalışır.
- **Dosyalar:** `ProfilePage.jsx`, `HomePage.jsx`.
- **Bağımlılık:** 1.2.7.

**1.2.10 Kampanya + indirim motoru** — *Kaan* · REQ-10
Üye sepet aşamasında, state'teki aktif kampanyalara göre ara toplam üzerine indirim. `calcSubtotal` çıktısının üzerine uygulanır.
- **Kabul:** Üyeye indirim yansır; ziyaretçiye yansımaz; sıralı uygulama.
- **Dosyalar:** `src/services/campaignService.js`, `CartPage.jsx`, `pricing.js`.
- **Bağımlılık:** 1.4.5 (fiyat), 1.2.3 (üye).

**1.5.6 CSV export + arşiv istatistik** — *Alptuğ* · REQ-20
Rapor verilerini tek butonla `.csv` indir; silinen/kalkan filmlerin geçmiş satışları istatistik havuzunda kalır.
- **Kabul:** CSV indirilir; arşiv verisi korunur.
- **Dosyalar:** `Reports.jsx`, `statsService`.
- **Bağımlılık:** 1.5.4, 1.5.5.

**1.3.10 Yorum formu + kısıtlar** — *Berke* · REQ-11.1
Üye yorum formu: 10–500 karakter, canlı sayaç, yasaklı kelime kontrolü; ziyaretçiye "Yorum yapmak için giriş yapın". Üye kendi yorumunu düzenler/siler.
- **Kabul:** Kısıtlar birebir; ziyaretçiye form hiçbir koşulda etkin değil.
- **Dosyalar:** `src/components/movies/CommentForm.jsx`, `MovieDetailsPage.jsx`.
- **Bağımlılık:** 1.2.3, 1.3.9.

> **🔍 Sprint 8 code review:** Kampanya indiriminin ara toplam sözleşmesine uyumu; yorum kısıt kuralları.

---

### 🟩 SPRINT 9 — Tema + yorum listesi + kapanış

**1.5.9 Light / Dark mod** — *Ömer* · REQ-23
Tek butonla, sayfa yenilemeden tema geçişi; durum Context/State'te; varsayılan Light. S1'den beri kullanılan CSS token'ları palete bağlanır.
- **Kabul:** Tüm ekranlar iki temada tutarlı; geçiş anlık.
- **Dosyalar:** `src/context/ThemeContext.jsx`, `Layout.jsx`, `src/index.css`.
- **Bağımlılık:** Token kuralı (§3.5) — tüm sprintlerde uyulmuş olmalı.

**1.3.11 Yorum listeleme + sıralama** — *Berke* · REQ-11
Film detayında mock + kullanıcı yorumlarını listele, tarihe göre sırala.
- **Kabul:** Yorumlar listelenir/sıralanır; boş durumda mesaj.
- **Dosyalar:** `src/components/movies/CommentList.jsx`, `MovieDetailsPage.jsx`.
- **Bağımlılık:** 1.3.10.

**Kaan + Alptuğ — Entegrasyon & UAT:** Uçtan uca akış testi (film→koltuk→bilet tipi→ödeme→başarı→profil), admin↔satış istatistik tutarlılığı, kalan bug-fix, `docs/cineseat_projeanaliz` REQ listesine karşı final kontrol.

> **🔍 Sprint 9 code review + FİNAL:** Tam regresyon; tüm REQ'ler karşılandı mı checklist; teknik borç (kök `tatus` dosyası silme, rezervasyon atomikliği) kapatıldı mı.

---

## 6. Bağımlılık Haritası (kritik zincirler)

- **Auth zinciri (Ömer):** 1.2.3 → 1.2.1 → 1.2.2 → 1.2.4 → (profil/favori/yorum/kampanya/admin-koruma). **1.2.3 gecikirse tüm ekip etkilenir.**
- **Ödeme zinciri (Kaan):** 1.4.3 → 1.4.4 → 1.4.5 → 1.4.8 → 1.4.7 → 1.4.9 → 1.2.9; kampanya 1.2.10 sonda (fiyat+üye hazır).
- **Admin (Alptuğ):** 1.5.1 → 1.5.2 → 1.5.3; rapor 1.5.4 → 1.5.5 → 1.5.6. Koruma için Ömer 1.2.4 (S4).
- **Katalog (Berke):** 1.3.1 → 1.3.5/1.3.6 → 1.3.3 → 1.3.4; sosyal 1.3.8 → 1.3.9 → 1.3.10 → 1.3.11 (auth'a bağlı).

## 7. Teknik Borç (plan boyunca kapatılacak)
- `seatService` güvensiz `JSON.parse` → **S1 / Kaan** (1.4.3 refactor'ünde).
- Rezervasyon atomik değil (kısmi yazım) → **S4-S5 / Kaan** (ödeme akışı elden geçerken).
- Rezervasyon no `CS-…` → `RES-#####` → **S4 / Kaan** (1.4.8).
- Kök dizindeki gereksiz `tatus` dosyası → **S9 kapanış**.
