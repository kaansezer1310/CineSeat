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
| 1.3.1 | Vizyonda / yakında sekme yapısı | ⬜ Kalan | HomePage tüm filmleri tek listede gösteriyor — REQ-08 |
| 1.3.2 | Film kartı bileşeni | ✅ Bitti | `components/movies/MovieCard.jsx` |
| 1.3.3 | Sıralama modülü: tarih ve puan | ⬜ Kalan | REQ-08.1 |
| 1.3.4 | Filtreleme modülü: tür ve yaş kısıtı | ⬜ Kalan | REQ-08.1 |
| 1.3.5 | Otomatik kategorizasyon ve arşiv | ⬜ Kalan | REQ-05 |
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
| 1.4.3 | Koltuk state makinesi: 4 durum | ⬜ Kalan | Kodda yalnız BOS/SEÇİLİ/DOLU var; `GECICI_KILITLI` ve geçişler eksik — REQ-01 |
| 1.4.4 | Sepet yapısı ve bilet tipi seçimi | 🟡 Kısmi → Kalan | Sepet var (`CartContext`/`cartReducer`); **bilet tipi (Yetişkin/Öğrenci/Çocuk) yok** — REQ-02 |
| 1.4.5 | Fiyat hesaplama: çarpan ve ara toplam | ⬜ Kalan | Şu an düz `adet × birimFiyat`; çarpanlar yok — REQ-02 |
| 1.4.6 | Sepet işlemleri: geri, değiştir, boşalt | ✅ Bitti | kaldır + sepeti temizle + link ile geri — REQ-12 |
| 1.4.7 | 3 dakikalık sayaç ve zaman aşımı | ⬜ Kalan | REQ-19 |
| 1.4.8 | Ödeme simülasyon ekranı | ⬜ Kalan | REQ-26 (kart formu) — şu an checkout doğrudan rezervasyon yapıyor |
| 1.4.9 | Ödeme başarısızlık ve hata ekranı | ⬜ Kalan | REQ-13 (test kartı, Tekrar Dene/Sepete Dön) |
| 1.4.10 | Başarı ekranı ve rezervasyon no | ✅ Bitti (temel) | `pages/SuccessPage.jsx` — **format `CS-…`, doküman `RES-#####` istiyor (REQ-22)** |

### 1.5 Yönetici Paneli ve Lokasyon — HİÇ BAŞLANMADI ⬜
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1.5.1 | Admin panel layout | ⬜ Kalan | |
| 1.5.2 | Film ekleme, silme ve güncelleme formu | ⬜ Kalan | REQ-04 |
| 1.5.3 | Form validasyonu ve silme onayı | ⬜ Kalan | REQ-04 |
| 1.5.4 | İstatistik hesaplama fonksiyonları | ⬜ Kalan | REQ-06 |
| 1.5.5 | Rapor tablo ve grafik görünümü | ⬜ Kalan | REQ-06 |
| 1.5.6 | CSV dışa aktarım ve arşiv istatistikleri | ⬜ Kalan | REQ-20 |
| 1.5.7 | Sinemalar sayfası ve şehir dropdown | ⬜ Kalan | REQ-07 |
| 1.5.8 | Geolocation, mesafe ve fallback | ⬜ Kalan | REQ-07 / REQ-07.1 |
| 1.5.9 | Light / dark mod uygulaması | ⬜ Kalan | REQ-23 |

**Özet:** 44 görevin **10'u tamamlanmış**, **34'ü kalmıştır.**
Tamamlananlar: 1.1.1–1.1.4, 1.3.2, 1.3.7, 1.4.1, 1.4.2, 1.4.6, 1.4.10.

---

## 2. Kalan Görevlerin Dağılımı (34 görev / 4 kişi)

Toplam efor ağırlığı **59 puan** → kişi başı hedef ≈ **14–15 puan**.

### 👤 Kaan Sezer — Rezervasyon & Ödeme Akışı
> En yüksek algoritmik karmaşıklık (koltuk durum makinesi, sayaç, ödeme).

| # | Görev | Ağırlık |
|---|-------|:---:|
| 1.4.3 | Koltuk state makinesi: 4 durum (BOS/SECILI/GECICI_KILITLI/DOLU) | 3 |
| 1.4.4 | Sepet yapısı + bilet tipi seçimi (Yetişkin/Öğrenci/Çocuk) | 2 |
| 1.4.5 | Fiyat hesaplama: çarpan ve ara toplam | 2 |
| 1.4.7 | 3 dakikalık sayaç ve zaman aşımı (REQ-19) | 2 |
| 1.4.8 | Ödeme simülasyon ekranı + kart formu (REQ-26) | 2 |
| 1.4.9 | Ödeme başarısızlık ve hata ekranı (REQ-13) | 1 |
| 1.2.9 | Ziyaretçi bilgi formu (Ad/Soyad/E-posta – REQ-03) | 1 |
| **Toplam** | **7 görev** | **13** |

### 👤 Alptuğ Dursun — Yönetici Paneli & Lokasyon
> Kendi içinde kapalı, bağımsız çalışılabilen büyük modül.

| # | Görev | Ağırlık |
|---|-------|:---:|
| 1.5.1 | Admin panel layout | 1 |
| 1.5.2 | Film ekleme/silme/güncelleme formu (REQ-04) | 3 |
| 1.5.3 | Form validasyonu ve silme onayı | 1 |
| 1.5.4 | İstatistik hesaplama fonksiyonları (REQ-06) | 2 |
| 1.5.5 | Rapor tablo ve grafik görünümü | 2 |
| 1.5.6 | CSV dışa aktarım ve arşiv istatistikleri (REQ-20) | 1 |
| 1.5.7 | Sinemalar sayfası ve şehir dropdown (REQ-07) | 2 |
| 1.5.8 | Geolocation, mesafe ve fallback (REQ-07.1) | 2 |
| **Toplam** | **8 görev** | **14** |

### 👤 Ömer Faruk Çendek — Kimlik, Profil & Favoriler
> Auth altyapısı ve ona bağlı üye alanı bir bütün olarak tek kişide.

| # | Görev | Ağırlık |
|---|-------|:---:|
| 1.2.1 | Login / register sayfaları | 2 |
| 1.2.2 | Form doğrulama kuralları ve regex (REQ-16/17) | 2 |
| 1.2.3 | Auth context ve oturum yönetimi (REQ-21) | 3 |
| 1.2.4 | ProtectedRoute ve rol kontrolü | 1 |
| 1.2.5 | Profil sayfası: kişisel bilgi formu (REQ-18) | 2 |
| 1.2.6 | Bilet sekmeleri: güncel ve geçmiş | 2 |
| 1.2.7 | İzleme listesi: kart ikonu ve state (REQ-24) | 2 |
| 1.2.8 | İzleme listem sekmesi ve bildirim (REQ-25) | 2 |
| 1.5.9 | Light / dark mod (REQ-23) — global tema, header/context ile aynı hat | 1 |
| **Toplam** | **9 görev** | **17** |

### 👤 İzzettin Berke Kuş — Katalog, Detay & Sosyal
> Çoğu küçük/orta boy görev; sayıca fazla ama efor olarak dengede.

| # | Görev | Ağırlık |
|---|-------|:---:|
| 1.3.1 | Vizyonda / yakında sekme yapısı (REQ-08) | 2 |
| 1.3.3 | Sıralama modülü: tarih ve puan | 1 |
| 1.3.4 | Filtreleme modülü: tür ve yaş kısıtı | 2 |
| 1.3.5 | Otomatik kategorizasyon ve arşiv (REQ-05) | 1 |
| 1.3.6 | Yakında 6 ay zaman kısıtı (REQ-15) | 1 |
| 1.3.8 | Fragman modalı ve fallback (REQ-09) | 2 |
| 1.3.9 | Puanlama modülü: 1-5 yıldız (REQ-11) | 1 |
| 1.3.10 | Yorum formu ve kısıtlar (REQ-11.1) | 2 |
| 1.3.11 | Yorum listeleme ve sıralama | 1 |
| 1.2.10 | Kampanya ve indirim motoru (REQ-10) | 2 |
| **Toplam** | **10 görev** | **15** |

### Denge Özeti
| Kişi | Modül | Görev | Ağırlık |
|------|-------|:---:|:---:|
| Kaan Sezer | Rezervasyon & Ödeme | 7 | 13 |
| Alptuğ Dursun | Admin & Lokasyon | 8 | 14 |
| Ömer Faruk Çendek | Kimlik & Üye Alanı | 9 | 17 |
| İzzettin Berke Kuş | Katalog & Sosyal | 10 | 15 |
| **Toplam** | | **34** | **59** |

Ağırlıklar 13–17 aralığında dengelidir. Kaan'ın puanı düşük görünse de en **karmaşık** görevleri (4 durumlu koltuk makinesi, ödeme akışı) taşıdığı için gerçek efor eşdeğerdir.

---

## 3. Bağımlılık Notları (dağıtımı etkileyen kritik sıra)

1. **1.2.3 Auth context (Ömer)** birçok görevin ön koşuludur — üye kampanyaları (Berke/1.2.10), yorum yazma (Berke/1.3.9-11), izleme listesi (Ömer), admin rol kontrolü (Alptuğ). **İlk sprintte bitmeli.**
2. **1.4.4 bilet tipi + 1.4.5 fiyat çarpanı (Kaan)**, **1.2.10 kampanya indirimi (Berke)** ile aynı "ara toplam" hesabına dokunur; Kaan ara toplam sözleşmesini (fonksiyon imzası) belirleyip Berke'ye vermeli.
3. **1.4.10 başarı ekranı zaten var** ama rezervasyon no formatı `CS-…` → doküman `RES-#####` istiyor (REQ-22). Kaan bunu ödeme akışında düzeltmeli.
4. **1.4.3 koltuk 4 durumu** mevcut `seatService`'in yeniden ele alınmasını gerektirir; Kaan'ın işi burada `getReservedSeatsBySessionId` etrafında yoğunlaşır.
5. **1.5.9 tema (Ömer)** global CSS/Layout'a dokunduğu için erken yapılırsa herkesin yeni ekranı temaya uyumlu doğar.

## 4. Kod incelemesinden taşınan teknik borç (dağıtım dışı, sahiplenilmeli)
- **seatService** güvenli olmayan `JSON.parse` → 1.4.3 sahibinde (Kaan).
- Rezervasyon atomik değil (kısmi yazım) → 1.4.x sahibinde (Kaan).
- Kök dizindeki gereksiz `tatus` dosyası silinmeli.
