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

### 1.2 Kimlik, Profil ve Favoriler — HİÇ BAŞLANMADI ⬜
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.2.1 | Login / register sayfaları | ⬜ Kalan | Kodda auth yok |
| 1.2.2 | Form doğrulama kuralları ve regex | ⬜ Kalan | REQ-16, REQ-17 |
| 1.2.3 | Auth context ve oturum yönetimi | ⬜ Kalan | Sadece `CartContext` var, `AuthContext` yok — REQ-21 |
| 1.2.4 | ProtectedRoute ve rol kontrolü | ⬜ Kalan | REQ-21, Güvenlik 4.2 |
| 1.2.5 | Profil sayfası: kişisel bilgi formu | ⬜ Kalan | REQ-18 |
| 1.2.6 | Bilet sekmeleri: güncel ve geçmiş | ⬜ Kalan | REQ-18 |
| 1.2.7 | İzleme listesi: kart ikonu ve state | ⬜ Kalan | REQ-24 |
| 1.2.8 | İzleme listem sekmesi ve bildirim | ⬜ Kalan | REQ-25 |
| 1.2.9 | Ziyaretçi bilgi formu | ⬜ Kalan | REQ-03 (Ad/Soyad/E-posta) — şu an checkout bu bilgiyi toplamıyor |
| 1.2.10 | Kampanya ve indirim motoru | ⬜ Kalan | REQ-10 |

### 1.3 Katalog, Detay, Sosyal — KISMEN BİTTİ 🟡
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.3.1 | Vizyonda / yakında sekme yapısı | ✅ Bitti (Sprint 1) | `HomePage.jsx` sekmeleri + `movieService.isMovieReleased`/`getDaysUntilRelease` — REQ-08 |
| 1.3.2 | Film kartı bileşeni | ✅ Bitti | `components/movies/MovieCard.jsx` |
| 1.3.3 | Sıralama modülü: tarih ve puan | ⬜ Kalan | REQ-08.1 |
| 1.3.4 | Filtreleme modülü: tür ve yaş kısıtı | ⬜ Kalan | REQ-08.1 |
| 1.3.5 | Otomatik kategorizasyon ve arşiv | ✅ Bitti (Sprint 2) | `movieService.isMovieArchived` + `HomePage.jsx` filtresi — REQ-05; veri `movies.js`'ten silinmiyor, `getMovieById` ile hâlâ erişilebilir |
| 1.3.6 | Yakında 6 ay zaman kısıtı | ⬜ Kalan | REQ-15 |
| 1.3.7 | Film detay sayfası | ✅ Bitti (temel) | `pages/MovieDetailsPage.jsx` — poster/meta/açıklama/seans var; fragman & yorum yok |
| 1.3.8 | Fragman modalı ve fallback | ⬜ Kalan | REQ-09 / REQ-09.1 |
| 1.3.9 | Puanlama modülü: 1-5 yıldız | ⬜ Kalan | REQ-11 |
| 1.3.10 | Yorum formu ve kısıtlar | ⬜ Kalan | REQ-11.1 |
| 1.3.11 | Yorum listeleme ve sıralama | ⬜ Kalan | REQ-11 |

### 1.4 Rezervasyon ve Ödeme — KISMEN BİTTİ 🟡
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.4.1 | Seans ve salon seçim ekranı | ✅ Bitti | `SessionList`/`SessionButton`, `BookingPage` seans bilgisi |
| 1.4.2 | Koltuk grid bileşeni | ✅ Bitti | `components/seats/SeatMap.jsx`, `Seat.jsx` |
| 1.4.3 | Koltuk state makinesi: 4 durum | ✅ Bitti (Sprint 1) | `domain/seatStatus.js` (BOS/SECILI/GECICI_KILITLI/DOLU + geçiş tablosu), `seatService.js` — REQ-01. Bilinen açık: kilit-sahiplik/token yok, bkz. `SPRINT1_REVIEW.md` Y3 |
| 1.4.4 | Sepet yapısı ve bilet tipi seçimi | ✅ Bitti (Sprint 2) | `domain/ticketType.js` + `cartReducer.js`'te `{seatId, ticketType}` yapısı, `BookingPage.jsx`/`CartPage.jsx`'te tip seçimi — REQ-02. Fiyat çarpanları henüz yok (1.4.5 kapsamı) |
| 1.4.5 | Fiyat hesaplama: çarpan ve ara toplam | ⬜ Kalan | Şu an düz `adet × birimFiyat`; çarpanlar yok — REQ-02 |
| 1.4.6 | Sepet işlemleri: geri, değiştir, boşalt | ✅ Bitti | kaldır + sepeti temizle + link ile geri — REQ-12 |
| 1.4.7 | 3 dakikalık sayaç ve zaman aşımı | ⬜ Kalan | REQ-19 |
| 1.4.8 | Ödeme simülasyon ekranı | ⬜ Kalan | REQ-26 (kart formu) — şu an checkout doğrudan rezervasyon yapıyor |
| 1.4.9 | Ödeme başarısızlık ve hata ekranı | ⬜ Kalan | REQ-13 (test kartı, Tekrar Dene/Sepete Dön) |
| 1.4.10 | Başarı ekranı ve rezervasyon no | ✅ Bitti (temel) | `pages/SuccessPage.jsx` — **format `CS-…`, doküman `RES-#####` istiyor (REQ-22)** |

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

**Özet (güncel — Sprint 2 / Kaan+Berke sonrası):** 44 görevin **23'ü tamamlanmış**, **21'i kalmıştır.**
Tamamlananlar: 1.1.1–1.1.4, 1.3.1, 1.3.2, 1.3.5, 1.3.7, 1.4.1, 1.4.2, 1.4.3, 1.4.4, 1.4.6, 1.4.10, 1.2.3, 1.5.1–1.5.8.

> Bu tablo ilk yazıldığında (Sprint 1 öncesi) sadece 10 görev bitmişti; Sprint 1 (Ömer/Kaan/Alptuğ/Berke'nin ilk görevleri) ve Sprint 2'nin şu ana kadar tamamlanan kısmı (Kaan'ın 1.4.4'ü, Berke'nin 1.3.5'i) buraya işlendi. Ömer'in 1.2.1'i ve Alptuğ'un Sprint 2 görevi henüz tamamlanmadığı için bu satırlar hâlâ ⬜.

---

## 2. Kalan Görevlerin Dağılımı — GÜNCEL (Sprint 2 ortası)

> Bu bölüm orijinal 34 görevlik dağıtımdı; artık **13 görev tamamlandığı** için aşağıdaki tablolar sadece **gerçekten kalan 21 görevi** gösterir. Tamamlanan görevler (1.3.1, 1.3.5, 1.4.3, 1.4.4, 1.2.3, 1.5.1–1.5.8) çıkarıldı — kanıtları §1'de.

Kalan efor ağırlığı **34 puan** (orijinal 59 − tamamlanan 25).

### 👤 Kaan Sezer — Rezervasyon & Ödeme Akışı
> 1.4.3 ve 1.4.4 tamamlandı (Sprint 1–2). Kalanlar:

| # | Görev | Ağırlık |
|---|-------|:---:|
| 1.4.5 | Fiyat hesaplama: çarpan ve ara toplam | 2 |
| 1.4.7 | 3 dakikalık sayaç ve zaman aşımı (REQ-19) | 2 |
| 1.4.8 | Ödeme simülasyon ekranı + kart formu (REQ-26) | 2 |
| 1.4.9 | Ödeme başarısızlık ve hata ekranı (REQ-13) | 1 |
| 1.2.9 | Ziyaretçi bilgi formu (Ad/Soyad/E-posta – REQ-03) | 1 |
| **Toplam** | **5 görev** | **8** |

### 👤 Alptuğ Dursun — Yönetici Paneli & Lokasyon
> **Tüm 1.5.x görevleri (8 görev, 14 puan) Sprint 1'de tek seferde tamamlandı** — bkz. `SPRINT1_REVIEW.md` §5. Bu modülde kalan görev **yok**. PLAN.md'nin Sprint 3–8'deki Alptuğ slotları boş kaldı; ekiple konuşulup ya yeni görev atanmalı ya da diğer kişilerin kalan yükü yeniden dengelenmeli.

| # | Görev | Ağırlık |
|---|-------|:---:|
| — | *(kalan görev yok)* | 0 |

### 👤 Ömer Faruk Çendek — Kimlik, Profil & Favoriler
> 1.2.3 tamamlandı (Sprint 1). Kalanlar:

| # | Görev | Ağırlık |
|---|-------|:---:|
| 1.2.1 | Login / register sayfaları | 2 |
| 1.2.2 | Form doğrulama kuralları ve regex (REQ-16/17) | 2 |
| 1.2.4 | ProtectedRoute ve rol kontrolü | 1 |
| 1.2.5 | Profil sayfası: kişisel bilgi formu (REQ-18) | 2 |
| 1.2.6 | Bilet sekmeleri: güncel ve geçmiş | 2 |
| 1.2.7 | İzleme listesi: kart ikonu ve state (REQ-24) | 2 |
| 1.2.8 | İzleme listem sekmesi ve bildirim (REQ-25) | 2 |
| 1.5.9 | Light / dark mod (REQ-23) — global tema, header/context ile aynı hat | 1 |
| **Toplam** | **8 görev** | **14** |

> Not: 1.2.4 (ProtectedRoute) kısmen zaten var — Sprint 1 review'da bulunan K2 güvenlik açığını kapatmak için `src/components/routing/ProtectedRoute.jsx` acil olarak eklendi (sadece `/admin` rotasını `allowedRoles={["admin"]}` ile sarıyor). Ömer bu görevi alırken var olan bileşeni genişletmeli (üye-only rotalar, `/login`'e yönlendirme vb.), sıfırdan yazmamalı.

### 👤 İzzettin Berke Kuş — Katalog, Detay & Sosyal
> 1.3.1 ve 1.3.5 tamamlandı (Sprint 1–2). Kalanlar:

| # | Görev | Ağırlık |
|---|-------|:---:|
| 1.3.3 | Sıralama modülü: tarih ve puan | 1 |
| 1.3.4 | Filtreleme modülü: tür ve yaş kısıtı | 2 |
| 1.3.6 | Yakında 6 ay zaman kısıtı (REQ-15) | 1 |
| 1.3.8 | Fragman modalı ve fallback (REQ-09) | 2 |
| 1.3.9 | Puanlama modülü: 1-5 yıldız (REQ-11) | 1 |
| 1.3.10 | Yorum formu ve kısıtlar (REQ-11.1) | 2 |
| 1.3.11 | Yorum listeleme ve sıralama | 1 |
| 1.2.10 | Kampanya ve indirim motoru (REQ-10) | 2 |
| **Toplam** | **8 görev** | **12** |

### Denge Özeti (kalan)
| Kişi | Modül | Kalan Görev | Kalan Ağırlık |
|------|-------|:---:|:---:|
| Kaan Sezer | Rezervasyon & Ödeme | 5 | 8 |
| Alptuğ Dursun | Admin & Lokasyon | 0 | 0 |
| Ömer Faruk Çendek | Kimlik & Üye Alanı | 8 | 14 |
| İzzettin Berke Kuş | Katalog & Sosyal | 8 | 12 |
| **Toplam** | | **21** | **34** |

Alptuğ'un iş yükü tükendiği için denge artık bozuk — bu, `SPRINT1_REVIEW.md`'de zaten süreç sorunu olarak işaretlendi (§5, "Alptuğ'un scope taşması"). Yeniden dengeleme ekiple birlikte yapılmalı, tek taraflı üstlenilmedi.

---

## 3. Bağımlılık Notları (dağıtımı etkileyen kritik sıra)

1. ✅ **1.2.3 Auth context (Ömer)** — tamamlandı (Sprint 1). Ona bağımlı görevler (Berke/1.2.10, Berke/1.3.9-11, Ömer/1.2.7-8, K2 admin koruması) artık başlayabilir.
2. **1.4.5 fiyat çarpanı (Kaan)**, **1.2.10 kampanya indirimi (Berke)** ile aynı "ara toplam" hesabına dokunacak; Kaan ara toplam sözleşmesini (fonksiyon imzası) belirleyip Berke'ye vermeli. 1.4.4 (bilet tipi altyapısı) zaten bitti, bu madde artık sadece 1.4.5'i bekliyor.
3. **1.4.10 başarı ekranı zaten var** ama rezervasyon no formatı hâlâ `CS-…` → doküman `RES-#####` istiyor (REQ-22). Henüz düzeltilmedi; Kaan bunu 1.4.8 (ödeme ekranı) kapsamında ele almalı (PLAN.md'de zaten bu şekilde not edilmiş).
4. ✅ **1.4.3 koltuk 4 durumu** — tamamlandı (Sprint 1), `domain/seatStatus.js` + `seatService.js` yeniden yazıldı.
5. **1.5.9 tema (Ömer)** hâlâ yapılmadı; global CSS/Layout'a dokunacağı için erken yapılırsa sonraki ekranlar temaya uyumlu doğar — bu tavsiye hâlâ geçerli.

## 4. Kod incelemesinden taşınan teknik borç (dağıtım dışı, sahiplenilmeli)
- ✅ **seatService** güvenli olmayan `JSON.parse` → Kaan tarafından 1.4.3 kapsamında düzeltildi (`try/catch` + şema doğrulama).
- Rezervasyon atomik değil (kısmi yazım) → hâlâ açık; `SPRINT1_REVIEW.md` O5'te ayrıca not edildi, backend olmadan tam çözülemiyor.
- ✅ Kök dizindeki gereksiz `tatus` dosyası silindi.
- **Yeni (Sprint 1 review'dan):** `/admin` koruması, case-sensitivity build hatası, sahte admin istatistikleri gibi kritik bulgular çıktı ve düzeltildi — tam liste `docs/SPRINT1_REVIEW.md`'de.
