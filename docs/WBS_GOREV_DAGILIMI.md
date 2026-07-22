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
| 1.2.2 | Form doğrulama kuralları ve regex | ✅ Bitti (Sprint 3, Ömer) | `validation.js` entegrasyonu (REQ-16, 17) |
| 1.2.3 | Auth context ve oturum yönetimi | ⬜ Kalan | Sadece `CartContext` var, `AuthContext` yok — REQ-21 |
| 1.2.4 | ProtectedRoute ve rol kontrolü | ✅ Bitti (Sprint 3, Ömer) | `/login` yönlendirmesi + üye yetkisi (REQ-21) |
| 1.2.5 | Profil sayfası: kişisel bilgi formu | ✅ Bitti (Sprint 3, Ömer) | `ProfilePage.jsx` içinde form eklendi (REQ-18) |
| 1.2.6 | Bilet sekmeleri: güncel ve geçmiş | ✅ Bitti (Sprint 3, Ömer; Berke düzeltti) | `ProfilePage.jsx` biletler (REQ-18). **Berke'nin review'unda gerçek bug bulundu:** ayrım `createdAt`'e (satın alma zamanı) bakıyordu, REQ-18 gösterim saatini istiyor — `sessionService.hasSessionPassed` ile düzeltildi, bkz. §5 |
| 1.2.7 | İzleme listesi: kart ikonu ve state | ✅ Bitti (Sprint 3, Ömer; Berke düzeltti) | `WatchlistProvider.jsx` + MovieCard/Details kalpleri (REQ-24). **Berke'nin review'unda gerçek bug bulundu:** geçersiz sahte-ref kullanıcı değişiminde state'i hiç senkronize etmiyordu — düzeltildi, bkz. §5 |
| 1.2.8 | İzleme listem sekmesi ve bildirim | ✅ Bitti (Sprint 3, Ömer; Berke tamamladı) | `ProfilePage.jsx` sekme (REQ-25). **Berke'nin review'unda eksik bulundu:** "bildirim bandı" kısmı hiç yazılmamıştı (sadece yorumda vardı) — `HomePage.jsx`'e eklendi, bkz. §5 |
| 1.2.9 | Ziyaretçi bilgi formu | ✅ Bitti (Sprint 3, Alptuğ + Ömer) | `PaymentPage.jsx` içinde `visitorForm` — REQ-03. Ad-Soyad 2-50 karakter doğrulaması (`minLength`/`maxLength`) eklendi, doğrulandı |
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

### 1.4 Rezervasyon ve Ödeme — TAMAMEN BİTTİ ✅
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.4.1 | Seans ve salon seçim ekranı | ✅ Bitti | `SessionList`/`SessionButton`, `BookingPage` seans bilgisi |
| 1.4.2 | Koltuk grid bileşeni | ✅ Bitti | `components/seats/SeatMap.jsx`, `Seat.jsx` |
| 1.4.3 | Koltuk state makinesi: 4 durum | ✅ Bitti (Sprint 1) | `domain/seatStatus.js` (BOS/SECILI/GECICI_KILITLI/DOLU + geçiş tablosu), `seatService.js` — REQ-01 |
| 1.4.4 | Sepet yapısı ve bilet tipi seçimi | ✅ Bitti (Sprint 2) | `domain/ticketType.js` + `cartReducer.js`'te `{seatId, ticketType}` yapısı, `BookingPage.jsx`/`CartPage.jsx`'te tip seçimi — REQ-02 |
| 1.4.5 | Fiyat hesaplama: çarpan ve ara toplam | ✅ Bitti (Sprint 3, Alptuğ) | `services/pricing.js` — `calcSubtotal(items)`, çarpanlar REQ-02 ile birebir |
| 1.4.6 | Sepet işlemleri: geri, değiştir, boşalt | ✅ Bitti | kaldır + sepeti temizle + link ile geri — REQ-12 |
| 1.4.7 | 3 dakikalık sayaç ve zaman aşımı | ✅ Bitti (Sprint 3, Alptuğ + Ömer) | Sayaç+kilit/kilit-açma çalışıyor. **Y3'teki kilit-çakışma (token) açığı kapatıldı** — `seatService.js`'te kilit deposu `{seatId: token}` map'ine dönüştürüldü, `PaymentPage.jsx`'in ürettiği `lockToken` uçtan uca (`lockSeats`/`releaseLockedSeats`/`reserveAllSeats`) geçiriliyor; Berke'nin review'unda gerçekten bağlı olduğu doğrulandı |
| 1.4.8 | Ödeme simülasyon ekranı | ✅ Bitti (Sprint 3, Alptuğ) | `pages/PaymentPage.jsx`, `/odeme` rotası, `RES-#####` üretimi — REQ-26 |
| 1.4.9 | Ödeme başarısızlık ve hata ekranı | ✅ Bitti (Sprint 3, Alptuğ + Ömer) | `PaymentErrorPage.jsx` + test kartı çalışıyor. **Koltuk-serbest-bırakma açığı kapatıldı** — `isNavigatingToNextStep` (gerçek `useRef`) ile başarısızlıkta kilitler korunuyor, yalnız "Sepete Dön" ile kasıtlı açılıyor; doğrulandı |
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
| 1.5.9 | Light / dark mod uygulaması | ✅ Bitti (Sprint 3, Ömer) | `ThemeProvider.jsx`/`useTheme.js` ve global CSS eklendi (REQ-23). Not: Admin panelinde 4 hardcoded hex renk var (`admin.css`), tema tokenlarına bağlı değil — düşük öncelikli, sahibi yok, bkz. §4 |

**Özet (güncel — Kaan'ın backlog'u Alptuğ tarafından, Berke'nin backlog'u Berke tarafından, Ömer'in backlog'u Ömer tarafından bitirildi):** 44 görevin **tümü (44/44) tamamlanmıştır.**
Tamamlananlar: 1.1.1–1.1.4, 1.2.1-1.2.10, 1.3.1-1.3.11, 1.4.1–1.4.10, 1.5.1–1.5.9. (Bazı teknik borçlar açık).

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

### 👤 Ömer Faruk Çendek — Kimlik, Profil & Favoriler — ✅ TAMAMLANDI
> Tüm 7 görev tamamlandı (Sprint 3, PR #16). Berke'nin review'unda 3 gerçek bug/eksik bulunup düzeltildi — bkz. §5.

| # | Görev | Ağırlık |
|---|-------|:---:|
| — | *(kalan görev yok)* | 0 |

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
| Ömer Faruk Çendek | Kimlik & Üye Alanı | 0 | 0 |
| İzzettin Berke Kuş | Katalog & Sosyal | 0 | 0 |
| **Toplam** | | **0** | **0** |

Projedeki 44/44 görev tamamlanmıştır. Dağıtılacak backlog görevi kalmamıştır. Geriye sadece §4 kısmında listelenen açık teknik borçlar (eksik bırakılmış uç senaryolar) kalmıştır.

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
- ✅ **Koltuk kilidi (`GECICI_KILITLI`) sahiplik/token kontrolü** → `SPRINT1_REVIEW.md` Y3; Ömer tarafından `lockToken` sistemiyle kapatıldı, uçtan uca bağlı olduğu doğrulandı (bkz. §5).
- ✅ **1.4.9'da ödeme başarısız olunca koltukların hemen serbest kalması** → Ömer tarafından `isNavigatingToNextStep` ile düzeltildi, doğrulandı (bkz. §5).
- ✅ 1.2.9 ziyaretçi formunda Ad-Soyad 2-50 karakter doğrulaması → Ömer tarafından eklendi, doğrulandı.
- ✅ **`WatchlistContext.jsx`'teki geçersiz sahte-ref bug'ı** (kullanıcı değişince state senkronize olmuyordu) → Berke'nin review'unda bulundu, düzeltildi (bkz. §5).
- ✅ **`ProfilePage.jsx`'teki bilet sekmesi ayrımı** (REQ-18'i yanlış uyguluyordu — satın alma zamanına bakıyordu, gösterim saatine değil) → Berke'nin review'unda bulundu, düzeltildi (bkz. §5).
- ✅ **1.2.8'in "bildirim bandı" kısmı eksikti** (REQ-25) → Berke'nin review'unda bulundu, `HomePage.jsx`'e eklendi (bkz. §5).
- ✅ 8 lint hatası (kullanılmayan değişkenler, geçersiz ARIA, `react-hooks/refs`, `react-refresh/only-export-components`) → Berke tarafından düzeltildi, `ThemeContext`/`WatchlistContext` projenin 3-dosya deseniyle (Context/Provider/hook) tutarlı hâle getirildi.
- ✅ Kök dizine yanlışlıkla commit edilmiş 4 adet `test_output*.txt` dosyası ve tekrar eden `docs/omer_status_2.md` silindi.
- ⬜ Admin panelinde (`admin.css`) 4 hardcoded hex renk tema tokenlarına bağlı değil — düşük öncelik, sahibi yok, görünürlüğü bozmuyor (sadece §3.5 kuralına küçük bir sapma).
- ⬜ Sinema kartındaki "Seansları Gör" butonu işlevsiz (sinema↔seans veri ilişkisi hiç modellenmemiş) → sahibi yok, Alptuğ üstlenebilir (`SPRINT1_REVIEW.md` O1).

## 5. Berke'nin ekip-geneli code review'u (bu revizyon)

Kullanıcı talebiyle: projenin main'e alınmış güncel hâli (Kaan/Alptuğ + Ömer'in tüm işleri dahil) uçtan uca incelendi, status dosyaları okundu, `npm run lint`/`test:run`/`build` çalıştırıldı, bulunanlar düzeltildi.

**Bulunan ve düzeltilen 3 gerçek bug (kod çalışıyordu ama yanlış davranıyordu):**
1. **`WatchlistContext.jsx`** — kullanıcı değişimini senkronize etmesi gereken kod, gerçek bir `useRef()` yerine her render'da yeniden oluşan düz bir obje kullanıyordu; koşul asla doğru olmuyordu (dead code + lint hatası). React'in resmi "render sırasında state ayarlama" deseniyle düzeltildi, regresyon testiyle kilitlendi.
2. **`ProfilePage.jsx` bilet sekmeleri** — REQ-18 "gösterim saati geçmiş/geçmemiş" istiyor, kod rezervasyonun satın alınma zamanına + sabit 3 saatlik pencereye bakıyordu. Türkçe tarih metnini (`"13 Temmuz"` + `"13:30"`) gerçek `Date`'e çeviren `sessionService.parseSessionDateTime`/`hasSessionPassed` yazıldı, sekme mantığı düzeltildi.
3. **1.2.8'in bildirim bandı kısmı** — REQ-25'in istediği "favori film vizyona girince bildirim" hiç kodlanmamıştı (WBS'te "bitti" işaretliydi). `HomePage.jsx`'e eklendi.

**Ek düzeltmeler:** 8 lint hatası (bkz. §4), `seatService.js`'teki artık kullanılmayan `reserveSeats` fonksiyonundaki yanıltıcı/eski yorum ve kullanılmayan değişken, 4 stray `test_output*.txt` dosyası, tekrar eden `omer_status_2.md`.

**Doğrulanan (Ömer'in iddia ettiği gibi doğru çalışıyor):** Kilit-token sistemi (Y3) uçtan uca bağlı, 1.4.9'daki kilit-koruma çalışıyor, ziyaretçi formu validasyonu doğru, `reserveAllSeats` gerçekten atomik.

**Yeni test kapsamı:** `sessionService.test.js` (+7), `WatchlistProvider.test.jsx` (+2), `ProfilePage.test.jsx` (+6, ilk kez), `HomePage.test.jsx` (+3, bildirim bandı).

**Sonuç:** `npm run test:run` → 23 dosya / 182 test ✅ · `npm run lint` → 0 hata ✅ · `npm run build` → başarılı ✅.
