# CineSeat — WBS Durum Analizi ve Görev Dağılımı

**Proje:** CINEVERSE / CineSeat Faz-1 (React + Vite, mock veri, frontend)
**Kaynaklar:** `docs/Work breakdown structure.png`, `docs/cineseat_projeanaliz (4).pdf` (REQ-01…REQ-27), mevcut kod tabanı (`src/`)
**Ekip:** Kaan Sezer · Alptuğ Dursun · Ömer Faruk Çendek · İzzettin Berke Kuş

Bu doküman, WBS'teki 44 yaprak görevin hangilerinin **mevcut kodda tamamlanmış** olduğunu tespit eder ve kalan **34 görevi** 4 kişiye yaklaşık eşit iş yükü (efor ağırlığı) düşecek biçimde dağıtır.

> **İş yükü ölçütü:** Görev sayısı tek başına adil değildir; her göreve karmaşıklığa göre bir **ağırlık puanı** verildi (1 = küçük, 2 = orta, 3 = büyük). Dağıtım hem puan toplamına hem de modül bütünlüğüne (çakışmayı azaltmak için ilişkili işleri aynı kişide toplama) göre yapıldı.

---

## 1. WBS Durum Tablosu (Tamamlanan / Kalan)

Durum, kodda kanıtı olan işe göre belirlendi.

### 1.1 Proje Altyapısı — TAMAMEN BİTTİ ✅
| # | Görev | Durum | Kanıt |
|---|-------|-------|-------|
| 1.1.1 | React + Vite geliştirme ortamı | ✅ Bitti | `vite.config.js`, `index.html`, `src/main.jsx` |
| 1.1.2 | Git repository ve branch stratejisi | ✅ Bitti | git deposu kurulu |
| 1.1.3 | Klasör yapısı ve kod standartları | ✅ Bitti | düzenli `src/` yapısı, `eslint.config.js` |
| 1.1.4 | Mock veri modeli ve servis katmanı | ✅ Bitti | `src/data/*`, `src/services/*` (movie/session/seat/reservation) |

### 1.2 Kimlik, Profil ve Favoriler — KISMEN BİTTİ 🟡
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.2.1 | Login / register sayfaları | ✅ Bitti (Sprint 2) | `LoginPage.jsx`, `RegisterPage.jsx`, `authService.register` — REQ-16, REQ-21. Render-body `navigate()` bug'ı düzeltildi, 13 test eklendi (bkz. `omer_STATUS.md`) |
| 1.2.2 | Form doğrulama kuralları ve regex | ⬜ Kalan | REQ-16, REQ-17 |
| 1.2.3 | Auth context ve oturum yönetimi | ⬜ Kalan | Sadece `CartContext` var, `AuthContext` yok — REQ-21 |
| 1.2.4 | ProtectedRoute ve rol kontrolü | ⬜ Kalan | REQ-21, Güvenlik 4.2 |
| 1.2.5 | Profil sayfası: kişisel bilgi formu | ⬜ Kalan | REQ-18 |
| 1.2.6 | Bilet sekmeleri: güncel ve geçmiş | ⬜ Kalan | REQ-18 |
| 1.2.7 | İzleme listesi: kart ikonu ve state | ⬜ Kalan | REQ-24 |
| 1.2.8 | İzleme listem sekmesi ve bildirim | ⬜ Kalan | REQ-25 |
| 1.2.9 | Ziyaretçi bilgi formu | ✅ Bitti (Sprint 3, Alptuğ) | `PaymentPage.jsx` içinde `visitorForm` — REQ-03. Ad-Soyad 2-50 karakter doğrulaması eksik (düşük öncelik) |
| 1.2.10 | Kampanya ve indirim motoru | ✅ Bitti (Sprint 3, Alptuğ) | `campaignService.getCampaignDiscount` — REQ-10, üyeye %10/ziyaretçiye yok/sıralı, kabul kriterleriyle doğrulandı |

### 1.3 Katalog, Detay, Sosyal — TAMAMEN BİTTİ ✅
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.3.1 | Vizyonda / yakında sekme yapısı | ✅ Bitti (Sprint 1) | `HomePage.jsx` sekmeleri + `movieService.isMovieReleased`/`getDaysUntilRelease` — REQ-08 |
| 1.3.2 | Film kartı bileşeni | ✅ Bitti | `components/movies/MovieCard.jsx` |
| 1.3.3 | Sıralama modülü: tarih ve puan | ✅ Bitti (Sprint 3, Berke) | `movieService.sortMovies` + `SortControl.jsx` — REQ-08.1 |
| 1.3.4 | Filtreleme modülü: tür ve yaş kısıtı | ✅ Bitti (Sprint 3, Berke) | `movieService.filterMovies` + `FilterControl.jsx` — REQ-08.1, sıralamayla birlikte çalışıyor |
| 1.3.5 | Otomatik kategorizasyon ve arşiv | ✅ Bitti (Sprint 2) | `movieService.isMovieArchived` + `HomePage.jsx` filtresi — REQ-05; veri `movies.js`'ten silinmiyor, `getMovieById` ile hâlâ erişilebilir |
| 1.3.6 | Yakında 6 ay zaman kısıtı | ✅ Bitti (Sprint 3) | `movieService.isWithinComingSoonWindow` + `HomePage.jsx` filtresi — REQ-15; veri `movies.js`'ten silinmiyor |
| 1.3.7 | Film detay sayfası | ✅ Bitti (temel) | `pages/MovieDetailsPage.jsx` — poster/meta/açıklama/seans var; fragman & yorum yok |
| 1.3.8 | Fragman modalı ve fallback | ✅ Bitti (Sprint 3, Berke) | `TrailerModal.jsx` — REQ-09/09.1, `fragmanYoutubeId` yoksa buton pasif, her zaman YouTube linki fallback |
| 1.3.9 | Puanlama modülü: 1-5 yıldız | ✅ Bitti (Sprint 3, Berke) | `ratingService.js` + `RatingStars.jsx` — REQ-11, yalnız üye + sadece vizyondaki filmlerde |
| 1.3.10 | Yorum formu ve kısıtlar | ✅ Bitti (Sprint 3, Berke) | `commentService.js` + `CommentForm.jsx` — REQ-11.1, 10-500 karakter + yasaklı kelime |
| 1.3.11 | Yorum listeleme ve sıralama | ✅ Bitti (Sprint 3, Berke) | `CommentList.jsx` — REQ-11, mock+kullanıcı yorumları, sahibi düzenler/siler |

### 1.4 Rezervasyon ve Ödeme — BÜYÜK ÖLÇÜDE BİTTİ 🟡 (2 açık boşlukla)
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.4.1 | Seans ve salon seçim ekranı | ✅ Bitti | `SessionList`/`SessionButton`, `BookingPage` seans bilgisi |
| 1.4.2 | Koltuk grid bileşeni | ✅ Bitti | `components/seats/SeatMap.jsx`, `Seat.jsx` |
| 1.4.3 | Koltuk state makinesi: 4 durum | ✅ Bitti (Sprint 1) | `domain/seatStatus.js` (BOS/SECILI/GECICI_KILITLI/DOLU + geçiş tablosu), `seatService.js` — REQ-01. Bilinen açık: kilit-sahiplik/token yok, bkz. `SPRINT1_REVIEW.md` Y3 |
| 1.4.4 | Sepet yapısı ve bilet tipi seçimi | ✅ Bitti (Sprint 2) | `domain/ticketType.js` + `cartReducer.js`'te `{seatId, ticketType}` yapısı, `BookingPage.jsx`/`CartPage.jsx`'te tip seçimi — REQ-02. Fiyat çarpanları henüz yok (1.4.5 kapsamı) |
| 1.4.5 | Fiyat hesaplama: çarpan ve ara toplam | ✅ Bitti (Sprint 3, Alptuğ) | `services/pricing.js` — `calcSubtotal(items)`, çarpanlar REQ-02 ile birebir |
| 1.4.6 | Sepet işlemleri: geri, değiştir, boşalt | ✅ Bitti | kaldır + sepeti temizle + link ile geri — REQ-12 |
| 1.4.7 | 3 dakikalık sayaç ve zaman aşımı | 🟡 Bitti ama eksik (Sprint 3, Alptuğ) | Sayaç+kilit/kilit-açma çalışıyor; **kilit-çakışma (Y3 token) kontrolü hâlâ yok** — sahibi yok, açık |
| 1.4.8 | Ödeme simülasyon ekranı | ✅ Bitti (Sprint 3, Alptuğ) | `pages/PaymentPage.jsx`, `/odeme` rotası, `RES-#####` üretimi — REQ-26 |
| 1.4.9 | Ödeme başarısızlık ve hata ekranı | 🟡 Bitti ama eksik (Sprint 3, Alptuğ) | `PaymentErrorPage.jsx` + test kartı çalışıyor; **koltuklar başarısızlıkta hemen serbest kalıyor** (spesifikasyona kısmen aykırı) — sahibi yok, açık |
| 1.4.10 | Başarı ekranı ve rezervasyon no | ✅ Bitti | `pages/SuccessPage.jsx` — format artık `RES-#####` (1.4.8 kapsamında düzeltildi, REQ-22) |

### 1.5 Yönetici Paneli ve Lokasyon — BÜYÜK ÖLÇÜDE BİTTİ 🟡
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.5.1 | Admin panel layout | ✅ Bitti | `AdminLayout.jsx` |
| 1.5.2 | Film ekleme, silme ve güncelleme formu | ✅ Bitti | `AdminMovieForm.jsx`, `AdminMoviesPage.jsx`, `movieService.js` |
| 1.5.3 | Form validasyonu ve silme onayı | ✅ Bitti | HTML5 required & window.confirm eklendi |
| 1.5.4 | İstatistik hesaplama fonksiyonları | ✅ Bitti | `AdminDashboard.jsx` içinde `reduce` ile yapıldı |
| 1.5.5 | Rapor tablo ve grafik görünümü | ✅ Bitti | `recharts` ile bar grafiği yapıldı |
| 1.5.6 | CSV dışa aktarım ve arşiv istatistikleri | ✅ Bitti | `react-csv` ile export eklendi |
| 1.5.7 | Sinemalar sayfası ve şehir dropdown | ✅ Bitti | `CinemasPage.jsx` |
| 1.5.8 | Geolocation, mesafe ve fallback | ✅ Bitti | `navigator.geolocation` ve Haversine eklendi |
| 1.5.9 | Light / dark mod uygulaması | ⬜ Kalan | REQ-23 |

**Özet (güncel — Kaan'ın backlog'u Alptuğ tarafından, Berke'nin backlog'u Berke tarafından bitirildi):** 44 görevin **37'si tamamlanmış**, **7'si kalmıştır.**
Tamamlananlar: 1.1.1–1.1.4, 1.3.1, 1.3.2, 1.3.3, 1.3.4, 1.3.5, 1.3.6, 1.3.7, 1.3.8, 1.3.9, 1.3.10, 1.3.11, 1.4.1–1.4.10 (tümü, 2'si eksikli — bkz. §4), 1.2.1, 1.2.3, 1.2.9, 1.2.10, 1.5.1–1.5.8.

> Sprint 1 ve Sprint 2 tamamen bitti. Kaan'ın backlog'u (5 görev) ve Berke'nin son maddesi (1.2.10), Alptuğ kendi modülünü bitirip boşta kaldığı için onun tarafından tamamlandı (`Alp` branch → main, PR #14). Ardından Berke kendi kalan 6 görevini de bitirdi. **Kalan 7 görev artık sadece Ömer'in** — dış bağımlılığı olmayan, tek oturumda bitirilebilir bir backlog (bkz. §2). Alptuğ'un ve Berke'nin kalan görevi yok.

---

## 2. Kalan Görevlerin Dağılımı — GÜNCEL (Sprint 2 sonrası, konsolide Sprint 3 backlog'u)

> Bu bölüm orijinal 34 görevlik dağıtımdı; artık **27 görev tamamlandığı** için aşağıdaki tablo sadece **gerçekten kalan 7 görevi** (hepsi Ömer'in) gösterir. **Sıralama artık bağımlılık zincirini yansıtır** (`docs/PLAN.md` §5 SPRINT 3'teki sırayla birebir aynı).

Kalan efor ağırlığı **12 puan** (orijinal 59 − tamamlanan 47).

### 👤 Kaan Sezer — Rezervasyon & Ödeme Akışı — ✅ TAMAMLANDI (Alptuğ tarafından)
> 5 görevin tamamı (1.4.5, 1.4.8, 1.4.7, 1.4.9, 1.2.9) `Alp` branch'inde bitirilip main'e mergelendi (PR #14). **2 açık boşluk var** (1.4.7 kilit-çakışma kontrolü, 1.4.9 başarısızlıkta kilit-serbest davranışı) — bkz. §4, sahibi yok.

| # | Görev | Ağırlık |
|---|-------|:---:|
| — | *(kalan görev yok — 2 açık boşluk teknik borç olarak izleniyor)* | 0 |

### 👤 Alptuğ Dursun — Yönetici Paneli & Lokasyon — ✅ TAMAMLANDI (kendi modülü + Kaan'ın modülü)
> **Tüm 1.5.x görevleri (8 görev, 14 puan) Sprint 1'de tek seferde tamamlandı** — bkz. `SPRINT1_REVIEW.md` §5. Ayrıca Kaan'ın 5 görevini + Berke'nin 1.2.10'unu da devralıp bitirdi. Bu modülde kalan görev **yok**.

| # | Görev | Ağırlık |
|---|-------|:---:|
| — | *(kalan görev yok)* | 0 |

### 👤 Ömer Faruk Çendek — Kimlik, Profil & Favoriler
> 1.2.3 ve 1.2.1 tamamlandı (Sprint 1–2). Kalanlar (backlog sırasıyla):

| Sıra | # | Görev | Ağırlık |
|:---:|---|-------|:---:|
| 1 | 1.2.2 | Form doğrulama kuralları ve regex (REQ-16/17) | 2 |
| 2 | 1.2.4 | ProtectedRoute ve rol kontrolü — **var olan `ProtectedRoute.jsx`'i genişlet, sıfırdan yazma** | 1 |
| 3 | 1.2.5 | Profil sayfası: kişisel bilgi formu (REQ-18) | 2 |
| 4 | 1.2.7 | İzleme listesi: kart ikonu ve state (REQ-24) | 2 |
| 5 | 1.2.8 | İzleme listem sekmesi ve bildirim (REQ-25) | 2 |
| 6 | 1.5.9 | Light / dark mod (REQ-23) — global tema | 1 |
| 7 | 1.2.6 | Bilet sekmeleri: güncel ve geçmiş — dış bağımlılığı kalmadı, Kaan'ın 1.4.8'i main'de ✅ | 2 |
| | **Toplam** | **7 görev** | **12** |

> Not: 1.2.4 (ProtectedRoute) kısmen zaten var — Sprint 1 review'da bulunan K2 güvenlik açığını kapatmak için `src/components/routing/ProtectedRoute.jsx` acil olarak eklendi (sadece `/admin` rotasını `allowedRoles={["admin"]}` ile sarıyor). Ömer bu görevi alırken var olan bileşeni genişletmeli (üye-only rotalar, `/login`'e yönlendirme vb.), sıfırdan yazmamalı.

### 👤 İzzettin Berke Kuş — Katalog, Detay & Sosyal — ✅ TAMAMLANDI
> Modülün tamamı bitti: 1.3.1, 1.3.5, 1.3.6, 1.3.3, 1.3.4, 1.3.8, 1.3.9, 1.3.10, 1.3.11, 1.2.10 (1.2.10 Alptuğ'un Kaan işiyle birlikte). Kalan görev yok.

| # | Görev | Ağırlık |
|---|-------|:---:|
| — | *(kalan görev yok)* | 0 |

### Denge Özeti (kalan)
| Kişi | Modül | Kalan Görev | Kalan Ağırlık |
|------|-------|:---:|:---:|
| Kaan Sezer | Rezervasyon & Ödeme | 0 | 0 |
| Alptuğ Dursun | Admin & Lokasyon | 0 | 0 |
| Ömer Faruk Çendek | Kimlik & Üye Alanı | 7 | 12 |
| İzzettin Berke Kuş | Katalog & Sosyal | 0 | 0 |
| **Toplam** | | **7** | **12** |

Kalan tek kişi Ömer — bu bir denge sorunu değil, sadece Ömer'in backlog'unu henüz bitirmemiş olması. **Sıralama ve tam görev detayları (Kabul/Dosyalar/Bağımlılık) artık `docs/PLAN.md` §5 "SPRINT 3 — Konsolide backlog" bölümünde** — bu tablo sadece özet, ayrıntı için oraya bakılmalı.

---

## 3. Bağımlılık Notları (dağıtımı etkileyen kritik sıra)

1. ✅ **1.2.3 Auth context (Ömer)** — tamamlandı (Sprint 1). Ona bağımlı görevler (Berke/1.2.10 ✅, Berke/1.3.9-11 ✅, Ömer/1.2.7-8, K2 admin koruması) artık başlayabilir/bitti.
2. ✅ **1.4.5 fiyat çarpanı (Kaan)** ve **1.2.10 kampanya indirimi (Berke)** ikisi de bitti, sözleşme (`calcSubtotal(items)`) doğrulandı.
3. ✅ **1.4.10 başarı ekranı** — rezervasyon no formatı `RES-#####`'e düzeltildi (1.4.8 kapsamında, REQ-22).
4. ✅ **1.4.3 koltuk 4 durumu** — tamamlandı (Sprint 1), `domain/seatStatus.js` + `seatService.js` yeniden yazıldı.
5. **1.5.9 tema (Ömer)** hâlâ yapılmadı; global CSS/Layout'a dokunacağı için erken yapılırsa sonraki ekranlar temaya uyumlu doğar — bu tavsiye hâlâ geçerli.
6. ✅ **Tek-sprint yürütme sırası — kapandı:** Kaan'ın backlog'u (Alptuğ tarafından), Berke'nin 1.2.10'u ve Berke'nin kalan 6 görevi bitip main'e alındı. Ömer'in 1.2.6'sını bekleten köprü de kapandı. Ömer'in kalan 7 görevi artık tamamen dış bağımlılıksız — tek kalan backlog bu. Ayrıntı: `docs/PLAN.md` §6-§7.

## 4. Kod incelemesinden taşınan teknik borç (dağıtım dışı, sahiplenilmeli)
- ✅ **seatService** güvenli olmayan `JSON.parse` → Kaan tarafından 1.4.3 kapsamında düzeltildi (`try/catch` + şema doğrulama).
- ✅ Rezervasyon atomikliği → `seatService.reserveAllSeats` ile çözüldü (önce tüm çiftleri doğrula, sonra hepsini yaz).
- ✅ Kök dizindeki gereksiz `tatus` dosyası silindi.
- ✅ Sprint 1 review'dan: `/admin` koruması, case-sensitivity build hatası, sahte admin istatistikleri — düzeltildi, tam liste `docs/SPRINT1_REVIEW.md`'de.
- ✅ Sprint 2 review'dan: `LoginPage.jsx`/`RegisterPage.jsx`'te render sırasında `navigate()` çağrısı → `useEffect`'e taşındı; 13 yeni test eklendi. Detaylar `docs/omer_STATUS.md` §4'te.
- ✅ Rezervasyon no formatı `RES-#####`'e düzeltildi (1.4.8 kapsamında).
- ⬜ **Koltuk kilidi (`GECICI_KILITLI`) sahiplik/token kontrolü hâlâ yok** → `SPRINT1_REVIEW.md` Y3; 1.4.7 "tamamlandı" işaretlendi ama bu kısım atlanmış. **Sahibi yok, açık.**
- ⬜ **1.4.9'da ödeme başarısız olunca koltuklar hemen serbest kalıyor** (spesifikasyon "kilitli kalır" diyordu) → sahibi yok, açık.
- ⬜ 1.2.9 ziyaretçi formunda Ad-Soyad 2-50 karakter doğrulaması yok → düşük öncelik, sahibi yok.
