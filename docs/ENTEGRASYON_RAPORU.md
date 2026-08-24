# CineSeat — Entegrasyon ve Düzeltme Raporu

> **Tarih:** 24 Ağustos 2026
> **Kapsam:** Kod incelemesinde çıkan bulguların giderilmesi + frontend'in gerçek API'ye bağlanması
> **İlgili belge:** [`FRONTEND_DENETIM_VE_PLAN.md`](./FRONTEND_DENETIM_VE_PLAN.md)

---

## 1. Durum özeti

| Kontrol | Önce | Sonra |
|---|---|---|
| `dotnet build CineSeat.slnx` | 0 hata | **0 hata** |
| `npm run lint` | 0 hata | **0 hata** |
| `npm run test:run` | 223 / 223 (28 dosya) | **219 / 219 (27 dosya)** |
| `npm run build` | 351,90 kB (gzip 107,31) | **339,96 kB (gzip 103,33)** + ayrı admin parçası |
| Mock veride çalışan servis | 7 | **0** |

> **Test sayısı neden düştü?** `ratingService` T10 gereği tamamen kaldırıldı
> (12 test) ve mock davranışını ölçen testlerin yerine gerçek sözleşmeyi ölçen
> daha az sayıda ama daha anlamlı test yazıldı. Kapsam daralmadı; ölçülen şey
> değişti.

---

## 2. Alınan kararlar

| Konu | Karar | Gerekçe |
|---|---|---|
| Enum uyuşmazlığı | **Backend'e `JsonStringEnumConverter`** | Frontend'de eşleme tablosu tutma derdi doğmaz; enum'a yeni değer eklendiğinde iki taraf sessizce ayrışmaz. API ve Swagger de okunaklı olur. |
| Backend değişiklikleri | **Bu turda yapıldı** | Üçü de küçük ve iyi tanımlı; entegrasyonun önündeki duvar bunlardı. §3'te Berke'nin onayına sunuluyor. |
| Kapsam | **Entegrasyon dahil** | Servislerin tamamı gerçek API'ye bağlandı. |

---

## 3. Backend değişiklikleri — Berke'nin onayına

Dördü de yeni ekleme; mevcut davranışı değiştiren tek şey enum serileştirme biçimi.

### 3.1 Enum'lar artık ad olarak taşınıyor
`Program.cs` → `AddJsonOptions(... new JsonStringEnumConverter())`

```
Önce:  { "ticketType": 1, "format": 3, "status": 2 }
Sonra: { "ticketType": "Adult", "format": "IMAX", "status": "Completed" }
```

**Etkilenen sözleşmeler:** `TicketType`, `SeatType`, `ScreeningFormat`,
`ReservationStatus`, `CampaignType`. Sayı bekleyen başka bir istemci yok.

### 3.2 `ShowtimeDto` zenginleştirildi
`HallName`, `CinemaName`, `TotalSeats` eklendi; iki liste handler'ında
projeksiyona alındı. `GetShowtimeById` navigation getirmediği için
projeksiyonlu sorguya çevrildi.

**Neden:** Seans listesi ekranda salon adıyla gösteriliyor. Bu alanlar DTO'da
olmasaydı istemci seans başına ayrı `/halls/{id}` çağırmak zorunda kalırdı —
liste başına N+1 istek.

### 3.3 `POST /api/seatlocks/renew` — kilit yenileme
Yeni: `RenewSeatLocksCommand` + validator + handler + controller ucu.

**Neden:** Plan T2'de "edinme, **yenileme** ve bırakma" diyordu ama yenileme
ucu yoktu. Tek tek `POST /seatlocks` yinelemek de süreyi uzatıyor ama koltuk
başına bir gidiş-geliş demek. Yeni uç seçimin tamamını tek istekte uzatır.

Güvenlik: yalnızca **çağıran kullanıcının kendi** kilitleri uzatılır. Süresi
dolmuş ya da artık başkasına ait bir kilit varsa istek tümden reddedilir —
sessizce uzatmak kullanıcıya "koltuk hâlâ senin" demek olurdu.

### 3.4 `GET /api/showtimes/{id}/seats` — koltuk haritası
Yeni: `ShowtimeSeatDto`, `ShowtimeSeatStatus` enum'u, query + handler.

**Neden:** Koltuk planını çizmek için "bu seansta hangi koltuk dolu" bilgisi
gerekiyordu ve **hiçbir uç bunu vermiyordu**. Kilitler `/seatlocks`'ta,
rezerve koltuklar ise hiçbir yerde sorgulanabilir değildi.

Dönen kayıt: `{ seatId, seatRow, seatColumn, type, isActive, status,
lockedByCurrentUser }`. `status` → `Available | Locked | Reserved`.
Rezervasyon kilitten baskındır (ödemesi tamamlanmış koltuk, üzerinde bayat
bir kilit kalsa da satılamaz). `lockedByCurrentUser` sayesinde kullanıcının
kendi tuttuğu koltuk arayüzde "başkası aldı" gibi görünmez.

---

## 4. Kod incelemesi bulguları — durum

| # | Bulgu | Durum |
|---|---|---|
| **K1** | Rezervasyon zinciri tarayıcıda | ✅ Giderildi |
| **K2** | Koltuk kimliği modeli uyuşmuyor | ✅ Giderildi |
| **K3** | Puan sistemi ikiye bölünmüş | ✅ Giderildi |
| **K4** | Dashboard uydurma veri gösteriyor | ✅ Giderildi |
| **Y1** | Enum'lar sayı, frontend string | ✅ Giderildi |
| **Y2** | Token süresi dolunca kilitlenme | ✅ Giderildi |
| **Y3** | `ShowtimeDto` ekranın ihtiyacını karşılamıyor | ✅ Giderildi |
| **Y4** | Arşivleme dili ve ekranı yok | ✅ Giderildi |
| **Y5** | Fiyat/indirim iki yerde hesaplanıyor | ✅ Giderildi |
| **Y6** | Profil düzenleme frontend'de yok | ✅ Giderildi |
| **O1** | `user.manage` izni ölü | ⏳ Kullanıcı yönetimi ekranı yazılınca |
| **O2** | RatingStars rol kontrolü kalıntısı | ✅ Bileşen tamamen kaldırıldı |
| **O3** | `alert()` / `confirm()` | ⏳ Kişi 2 · Faz 2 |
| **O4** | Ölü mock veri | ✅ Temizlendi |
| **O5** | 76 CS8618 uyarısı | ⏳ Backend hijyeni |
| — | Plan belgesindeki T2 notu hatalıydı | ✅ Belge düzeltildi |

---

## 5. Yapılanlar — ayrıntı

### 5.1 Oturum süresi (Y2)
- `apiClient` → `setUnauthorizedHandler()`. 401 geldiğinde **ve elde token
  varken** kayıtlı geri çağrım tetiklenir. (Misafirin aldığı 401 normaldir,
  oturum düşürülmez.)
- `AuthProvider` mount olurken kendini kaydeder; oturumu düşürür ve
  `isSessionExpired` bayrağını kaldırır.
- Korumalı rotadaki kullanıcı zaten `ProtectedRoute` üzerinden `/login`'e
  gider — ayrıca `navigate` çağırmaya gerek yok. `LoginPage` "Oturumunuzun
  süresi doldu" mesajını gösterir.

### 5.2 Koltuk modeli (K2)
- Yeni `domain/seat.js`: `formatSeatLabel(row, column)` (1→A, 27→AA),
  `mapShowtimeSeatStatus(status, lockedByCurrentUser)`.
- `SeatMap` artık `totalSeats` almıyor, **gerçek koltuk listesi** alıyor. Her
  koltuk kendi (satır, sütun) konumuna yerleşiyor → devre dışı koltuklar
  planda doğal bir boşluk bırakıyor; "düzgün dikdörtgen salon" varsayımı yok.
- `Seat` bileşeni `seatId` (backend kimliği) ile `label` ("A5") ayrımını yapıyor.
- `cartReducer` sayısal koltuk kimliğini kabul ediyor; **eski metin kimlikler
  de kabul edilmeye devam ediyor** — yoksa mevcut sepetler sessizce boşalırdı.

### 5.3 Servislerin gerçek API'ye bağlanması (K1)

| Servis | Bağlandığı uç(lar) |
|---|---|
| `sessionService` | `GET /showtimes/by-movie/{id}`, `GET /showtimes/{id}` |
| `seatService` | `GET /showtimes/{id}/seats`, `POST /seatlocks`, `POST /seatlocks/renew`, `DELETE /seatlocks/{id}` |
| `reservationService` | `POST /reservations`, `GET /reservations/my`, `GET /reservations` |
| `campaignService` | `GET /campaigns/active` |
| `commentService` | `GET/POST/DELETE /comments` |
| `favoriteService` *(yeni)* | `GET/POST/DELETE /favorites` |
| `cinemaService` *(yeni)* | `GET /cinemas` + `/districts` + `/cities` |
| `profileService` *(yeni)* | `GET /profile`, `PUT /profile` |

**Ödeme akışı:**
1. `/payment`'a girildiğinde sepetteki koltuklar kilitlenir. Araya giren bir
   çakışmada o ana kadar alınan kilitler bırakılır — aksi hâlde kullanıcı hiç
   kullanmayacağı koltukları dakikalarca tutardı.
2. Geri sayım **en erken biten kilide** göre kurulur.
3. Sepet birden fazla seans içerebilir; backend rezervasyon başına tek seans
   kabul ettiği için her sepet öğesi ayrı rezervasyona dönüşür. Araya giren
   hatada oluşturulmuş rezervasyonlar iptal edilir.
4. Ödeme hatasında kilitler hemen bırakılır (`seatLockStorage`).

**Önemli davranış değişikliği:** `/payment` ve `/payment-error` artık
**korumalı rotalar**. Backend `ReservationsController` sınıf düzeyinde
`[Authorize]` taşıyor; misafir formu doldurup 401 alırdı. Misafir ödeme formu
kaldırıldı, yerine oturumdan ön doldurulan **alıcı bilgileri** formu geldi
(backend `BuyerFname/Lname/Email` zorunlu tutuyor).

### 5.4 Fiyat ve indirim (Y5)
İstemci artık **toplam göndermiyor**, yalnızca `campaignId` gönderiyor.
Sepet ve ödeme ekranındaki tutar bir **ön izleme**; bağlayıcı hesap backend'de.
Ekranda da belirtiliyor: *"Kesin tutar ödeme onaylandığında sunucuda
hesaplanır."*

Backend tek kampanya kabul ettiği için (`CampaignId`) frontend de kampanyaları
üst üste bindirmiyor — `pickBestCampaign` en çok indirim sağlayanı seçiyor.

### 5.5 Puan ve yorum birleşmesi (K3 / T10)
- `ratingService` ve `RatingStars` **silindi**.
- `CommentForm` artık yıldız içeriyor: **puan zorunlu, metin isteğe bağlı**.
- `CommentList` her yorumun puanını gösteriyor; metinsiz kayıtlar için
  "Yorum yazılmamış, yalnızca puan verilmiş." yazıyor.
- Düzenleme arayüzü kaldırıldı — backend güncelleme ucu sunmuyor
  (yalnızca ekle/sil).
- Silme yetkisi iki kaynaktan gelebiliyor: kaydın sahibi olmak **ya da**
  `comment.moderate` iznine sahip olmak. Aynı ayrımı backend de yapıyor.

### 5.6 Yönetim raporu (K4)
`AdminDashboard` `GET /api/reservations`'a bağlandı (`status: "Completed"` —
iptaller ciroya girmiyor). Hata durumu ekranda gösteriliyor. CSV dışa aktarımı
artık gerçek veriyi veriyor.

### 5.7 Arşivleme (Y4 / T7)
- `movieService.deleteMovie` → `archiveMovie`; `restoreMovie` ve
  `getArchivedMovies` eklendi.
- `AdminMoviesPage`'e **Arşivi Göster / Katalogu Göster** sekmesi ve
  **Geri Al** eylemi eklendi.
- Onay metni düzeltildi: *"…arşivlemek istediğinize emin misiniz? Kayıt
  silinmez, arşivden geri alınabilir."*

### 5.8 Favoriler, sinemalar, profil
- `WatchlistProvider` localStorage'dan çıkıp API'ye geçti; sorgu anahtarı
  kullanıcıyı içerdiği için çıkış/giriş sonrası önceki listenin ekranda
  kalması mümkün değil.
- `CinemasPage`'deki sabit `CINEMAS` dizisi kalktı; şehir adı ilçe → şehir
  eşlemesiyle `cinemaService` içinde kuruluyor (sayfa üç ucu birleştirmiyor).
- Profil düzenleme çalışıyor (`PUT /api/profile`). E-posta, kullanıcı adı ve
  rol bilinçli olarak gönderilmiyor — backend de kabul etmiyor.

---

## 6. Sırada ne var

### 6.1 Kişi 2 · Faz 2 — ortak bileşenler
- [ ] `ConfirmDialog`, `Toast`, `StatCard` bileşenleri
- [ ] `alert()` / `confirm()` çağrılarının değiştirilmesi
      (`AdminMoviesPage`, `AdminMovieForm`)
- [ ] Ortak yükleniyor / hata / yetkisiz durumlarının standardizasyonu

### 6.2 Kalan admin ekranları (Faz 3)
Ekranlar yazıldıkça `AdminLayout.jsx` içindeki `NAVIGATION_SECTIONS` dizisine
eklenecek — bağlantı, ekran yazılmadan eklenmemeli (kullanıcı 404'e düşer).

- [ ] Sinema / şehir / ilçe yönetimi
- [ ] Salon, koltuk, teknoloji yönetimi
- [ ] Seans yönetimi (çakışma + tarih/saat doğrulaması)
- [ ] Kampanya yönetimi
- [ ] Rezervasyon/bilet liste ve detay görünümü
- [ ] Yorum moderasyonu ekranı
- [ ] Kullanıcı yönetimi → **`user.manage` izni bunu bekliyor** (seed
      ediliyor, policy kayıtlı, ama hiçbir controller kullanmıyor)

### 6.3 Ödeme simülasyonu (T6)
Şu an yalnızca "0000 ile başlayan kart reddedilir" kuralı ve demo uyarısı var.

- [ ] Payment adapter sınırı (simüle ve gerçek sağlayıcı aynı arayüzü kullansın)
- [ ] Luhn kontrolü, marka/uzunluk doğrulaması
- [ ] Son kullanma tarihi biçimi + gelecekte olma kontrolü
- [ ] CVV'nin karta göre 3/4 hane olması
- [ ] Alan bazlı, erişilebilir hata mesajları
- [ ] Çift gönderim engeli

### 6.4 Backend hijyeni
- [ ] 76 adet CS8618 uyarısı (entity navigation property'leri) — `required`
      ya da `= null!` ile temizlenebilir. Hata değil ama gerçek uyarıları
      gömüyor.
- [ ] Kilit yenileme, eşzamanlı koltuk seçimi ve izin matrisi için
      **entegrasyon testleri** (Kişi 2 · Faz 5)

### 6.5 Cila (Faz 5)
- [ ] Klavye gezintisi, görünür odak ve 360 px görünümlerin uçtan uca denetimi
- [ ] Misafir / kullanıcı / kısıtlı yetkili / tam admin rolleriyle kabul testi

---

## 7. Dikkat edilecekler

**Uçtan uca denenmedi.** Testler ve derleme yeşil, ancak çalışan bir backend
ve dolu bir veritabanıyla gerçek bir bilet alma akışı henüz denenmedi. İlk
denemede şunlara bakın:

1. **Seed verisi yeterli değil.** `DbInitializer` şehir/ilçe, rol/izin ve admin
   kullanıcısını ekliyor; ancak **sinema, salon, koltuk, film ve seans**
   eklemiyor. Koltuk planını görebilmek için en az bir sinema + salon +
   koltuk + film + seans kaydı gerekiyor. Bunlar admin uçlarından
   (`POST /cinemas`, `/halls`, `/seats/bulk`, `/movies`, `/showtimes`)
   eklenebilir.
2. **Admin girişi:** kullanıcı `admin`, şifre `Admin123!` (bkz.
   `DbInitializer`).
3. **Enum değişikliği Swagger çıktısını da değiştirdi.** Elinizde Postman
   koleksiyonu varsa artık sayı yerine ad göndermesi gerekiyor
   (`"ticketType": "Adult"`).
4. **`/payment` artık korumalı.** Misafirle test ederseniz `/login`'e
   yönlendirilirsiniz — bu beklenen davranış, hata değil.
5. **Tarayıcı önbelleği:** oturum `sessionStorage`'da tutulduğu için, eski
   sürümden kalan bir oturumla test ederken sekmeyi kapatıp açmak gerekebilir
   (izin listesi eski token'da yok).
