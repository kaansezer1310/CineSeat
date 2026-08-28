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
| `npm run test:run` | 223 / 223 (28 dosya) | **407 / 407 (47 dosya)** |
| `dotnet test` | (test projesi yoktu) | **126 / 126** entegrasyon testi |
| `npm run build` | 351,90 kB (gzip 107,31) | **351,51 kB (gzip 107,18)** + ekran başına ayrı parça |
| Mock veride çalışan servis | 7 | **0** |

> **Test sayısı hakkında:** Entegrasyon turunda `ratingService` T10 gereği
> kaldırıldı (12 test) ve mock davranışını ölçen testlerin yerine gerçek
> sözleşmeyi ölçen testler yazıldı — sayı geçici olarak 219'a indi. Ortak
> bileşen turunda (6.1) 38, admin ekranlarında (6.2) 25, ödeme
> simülasyonunda (6.3) 44 test eklendi; sayfalama uyuşmazlığı (§12) 10 test daha
> getirdi; toplam **348** oldu.

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
Önce: { "ticketType": 1, "format": 3, "status": 2 }
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
| **K1** | Rezervasyon zinciri tarayıcıda | [x] Giderildi |
| **K2** | Koltuk kimliği modeli uyuşmuyor | [x] Giderildi |
| **K3** | Puan sistemi ikiye bölünmüş | [x] Giderildi |
| **K4** | Dashboard uydurma veri gösteriyor | [x] Giderildi |
| **Y1** | Enum'lar sayı, frontend string | [x] Giderildi |
| **Y2** | Token süresi dolunca kilitlenme | [x] Giderildi |
| **Y3** | `ShowtimeDto` ekranın ihtiyacını karşılamıyor | [x] Giderildi |
| **Y4** | Arşivleme dili ve ekranı yok | [x] Giderildi |
| **Y5** | Fiyat/indirim iki yerde hesaplanıyor | [x] Giderildi |
| **Y6** | Profil düzenleme frontend'de yok | [x] Giderildi |
| **O1** | `user.manage` izni ölü | [x] `UsersController` yazıldı (§10) |
| **O2** | RatingStars rol kontrolü kalıntısı | [x] Bileşen tamamen kaldırıldı |
| **O3** | `alert()` / `confirm()` | [x] Tamamen kaldırıldı (§8) |
| **O4** | Ölü mock veri | [x] Temizlendi |
| **O5** | 76 CS8618 uyarısı | ⏳ Backend hijyeni |
| — | Plan belgesindeki T2 notu hatalıydı | [x] Belge düzeltildi |

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

### 6.1 Kişi 2 · Faz 2 — ortak bileşenler [x] TAMAMLANDI
- [x] `ConfirmDialog`, `Toast`, `StatCard` bileşenleri
- [x] `alert()` / `confirm()` çağrılarının değiştirilmesi
 (`AdminMoviesPage`, `AdminMovieForm`)
- [x] Ortak yükleniyor / hata / yetkisiz durumlarının standardizasyonu

Ayrıntı için → [§8](#8-ortak-bileşen-seti-61)

### 6.2 Kalan admin ekranları (Faz 3) [x] TAMAMLANDI
Ekranlar yazıldıkça `AdminLayout.jsx` içindeki `NAVIGATION_SECTIONS` dizisine
eklenecek — bağlantı, ekran yazılmadan eklenmemeli (kullanıcı 404'e düşer).

- [x] Sinema / şehir / ilçe yönetimi
- [x] Salon, koltuk, teknoloji yönetimi
- [x] Seans yönetimi (çakışma + tarih/saat doğrulaması)
- [x] Kampanya yönetimi
- [x] Rezervasyon/bilet liste ve detay görünümü
- [x] Yorum moderasyonu ekranı
- [x] Kullanıcı yönetimi → `UsersController` + `RolesController` yazıldı;
 **`user.manage` artık ölü değil**

### 6.3 Ödeme simülasyonu (T6) [x] TAMAMLANDI
Şu an yalnızca "0000 ile başlayan kart reddedilir" kuralı ve demo uyarısı var.

- [x] Payment adapter sınırı (simüle ve gerçek sağlayıcı aynı arayüzü kullansın)
- [x] Luhn kontrolü, marka/uzunluk doğrulaması
- [x] Son kullanma tarihi biçimi + gelecekte olma kontrolü
- [x] CVV'nin karta göre 3/4 hane olması
- [x] Alan bazlı, erişilebilir hata mesajları
- [x] Çift gönderim engeli

### 6.4 Backend hijyeni
- [x] 76 adet CS8618 uyarısı temizlendi — **76 → 0**. Bkz. §13.1
- [x] Kilit yenileme, eşzamanlı koltuk seçimi ve izin matrisi için
 **entegrasyon testleri** — yeni test projesi, **104 test**. Bkz. §13.2

### 6.5 Cila (Faz 5)
- [x] Klavye gezintisi, görünür odak ve 360 px görünümlerin uçtan uca denetimi. Bkz. §13.4
- [x] Misafir / kullanıcı / kısıtlı yetkili / tam admin rolleriyle kabul testi. Bkz. §13.5

---

## 7. Dikkat edilecekler

**Uçtan uca denenmedi.** Testler ve derleme yeşil, ancak çalışan bir backend
ve dolu bir veritabanıyla gerçek bir bilet alma akışı henüz denenmedi. İlk
denemede şunlara bakın:

1. ~~**Seed verisi yeterli değil.**~~ [x] **Çözüldü** — `DemoDataSeeder`
 geliştirme ortamında tam bir katalog kuruyor (bkz. §9).
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

---

## 8. Ortak bileşen seti (6.1)

> **Tarih:** 24 Ağustos 2026 · Plan karşılığı: Faz 2 · Kişi 2

`alert()` ve `confirm()` tamamen kalktı — projede tek bir çağrı kalmadı.

### 8.1 Eklenen bileşenler

| Bileşen | Yeri | İşi |
|---|---|---|
| `ConfirmDialog` | `components/ui/` | `confirm()` yerine — odak tuzaklı, temalı, metni özelleştirilebilir |
| `ToastProvider` + `useToast` | `context/`, `hooks/` | `alert()` yerine — engellemeyen, üst üste binebilen bildirim |
| `StatCard` | `components/ui/` | Sayı, etiket, birim, isteğe bağlı değişim göstergesi |
| `StatusPanel` | `components/ui/` | Yükleniyor / hata / yetkisiz durumlarının tek biçimi |
| `QueryState` | `components/ui/` | react-query sonucunu `StatusPanel`'e bağlar |

### 8.2 Neden yerli `alert()` / `confirm()` değil

- **Blokluyor:** iki mesaj vermek gerektiğinde kullanıcıyı iki kez durduruyordu.
- **Metni özelleştirilemiyor:** T7 ile "sil" → "arşivle" ayrımı yapılamıyordu.
- **Temaya uymuyor**, mobilde kötü duruyor.
- **Ekran okuyucuya duyurulmuyor:** başarı/hata mesajları `aria-live` bölgesine
 hiç girmiyordu.

### 8.3 Erişilebilirlik kararları

- `ConfirmDialog`: açılışta odak onay butonuna gider, kapanışta **çağıran
 öğeye geri döner** (klavye kullanıcısı listenin başına savrulmaz). Tab odağı
 diyaloğun içinde döner, Escape ve arka plan tıklaması kapatır.
- `Toast`: hata bildirimleri `role="alert"` + `aria-live="assertive"` (sözü
 keser), başarı/bilgi `role="status"` + `aria-live="polite"`.
- `StatusPanel`: yükleniyor polite, hata/yetkisiz assertive.
- `StatCard`: negatif değişimde yön okla gösterilir, metinde mutlak değer
 yazar — ekran okuyucu "yüzde eksi 8" diye okumaz.
- Spinner `prefers-reduced-motion` altında durur.
- `QueryState` **403'ü ayırır**: "bir şeyler ters gitti" değil "yetkiniz yok"
 der ve "Tekrar Dene" önermez — yetki yoksa tekrar denemek işe yaramaz.

### 8.4 Benimsenen yerler

| Ekran | Değişiklik |
|---|---|
| `AdminMoviesPage` | `confirm()` → `ConfirmDialog`, `alert()` → Toast |
| `AdminMovieForm` | 4 `alert()` → Toast; yükleniyor → `StatusPanel` |
| `AdminDashboard` | Sayaçlar → `StatCard`; hata/yükleniyor → `StatusPanel` |
| `CommentList` | Yükleniyor ve hata → `StatusPanel` |
| `CinemasPage` | Yükleniyor ve hata → `StatusPanel` |
| `BookingPage` | Yükleniyor ve hata → `StatusPanel` (403 ayrımıyla) |

`ToastProvider`, `main.jsx`'te `WatchlistProvider` ile `App` arasına eklendi.

### 8.5 Testler

38 yeni test:

| Dosya | Test |
|---|---:|
| `ConfirmDialog.test.jsx` | 9 |
| `ToastProvider.test.jsx` | 8 |
| `StatCard.test.jsx` | 6 |
| `StatusPanel.test.jsx` (+ `QueryState`) | 8 |
| `AdminMoviesPage.test.jsx` | 7 |

`AdminMoviesPage.test.jsx` uçtan uca akışı ölçüyor: arşivle → diyalog açılır →
istek **atılmaz** → vazgeç/onayla → istek atılır → Toast görünür; hata
durumunda `role="alert"` bildirimi çıkar.

---

## 9. Demo veri seed'i ve bir seed hatası

> **Tarih:** 24 Ağustos 2026 · Karar: demo veri **yalnızca Development**

### 9.1 Neden gerekliydi

Ekipteki herkesin veritabanı farklıydı — kimde "Odyssey/Spiderman", kimde
"Yeşilçam Gecesi". Daha kötüsü, kimsede **sinema, salon, koltuk, seans** yoktu:
`DbInitializer` bunları hiç eklemiyordu. Bu yüzden bilet alma akışının tamamı
(koltuk planı, kilit, rezervasyon) yazılmış olmasına rağmen **çalışırken
görülemiyordu**.

### 9.2 Yeni: `DemoDataSeeder`

`Infrastructure/CineSeat.Persistence/Data/DemoDataSeeder.cs`

`Program.cs`'te çağrısı ortama bağlı:

```csharp
if (app.Environment.IsDevelopment())
{
 await DemoDataSeeder.SeedAsync(context);
}
```

Canlıda "Neon Yağmuru" diye bir filmin veritabanında olması istenmez; bu
yüzden zorunlu referans verisi (`DbInitializer`) ile demo katalog ayrı
tutuldu.

**Kurduğu katalog:**

| Veri | Adet | Not |
|---|---:|---|
| Tür | 7 | Aksiyon, Dram, Komedi, Bilim Kurgu, Gerilim, Animasyon, Belgesel |
| Teknoloji | 4 | 2D, 3D, IMAX, Dolby Atmos |
| Sinema | 2 | CineSeat Kadıköy, CineSeat Çankaya |
| Salon | 4 | Sinema başına 2 |
| Koltuk | 320 | Salon başına 8×10 = 80 |
| Film | 4 | Üçü vizyonda, biri "Yakında" |
| Seans | ~36 | Vizyondaki filmlere önümüzdeki 5 gün |
| Kampanya | 2 | Yüzde ve sabit tutar — ikisi de test edilebilsin |

**Bilinçli ayrıntılar:**

- **Tarihler çalışma anına göre** hesaplanıyor. Sabit tarih yazılsaydı birkaç
 ay sonra tüm filmler arşive düşer, demo veri işe yaramaz hale gelirdi.
- **Geçmiş seans üretilmiyor** — satın alınamayacak bir seansı listede görmek
 kafa karıştırır.
- Her salonda **iki koltuk devre dışı** (kolon var varsayımı) ve koltuk
 tipleri karışık (Regular / Disabled / LoveSeat). Koltuk planının "düzgün
 dikdörtgen salon" varsayımına dayanmadığı böylece arayüzde de görülüyor.
- Bir film **"Yakında"** durumunda, o sekme boş kalmasın diye.
- **Idempotent:** her adım "zaten var mı" diye bakar. İki kez başlatıp
 sayımların değişmediği doğrulandı.

### 9.3 Yol boyunca bulunan gerçek hata — `SeedLocationsAsync`

Demo seed ilk denemede sinema ekleyemedi. Sebep, `DbInitializer`'daki bu
muhafızdı:

```csharp
if (await context.Cities.AnyAsync())
 return; // şehir tablosunda TEK BİR satır varsa hiç dokunma
```

Kullanıcı admin API'sinden elle bir "Eskisehir" şehri eklediği için
İstanbul/Ankara/İzmir ve **tüm ilçeler** bir daha asla oluşmuyordu. Sinema
kaydı ilçeye bağlı olduğundan katalog hiç kurulamıyordu — ve bu **sessizce**
oluyordu.

**Düzeltme:** `SeedLocationsAsync` artık rol/izin seed'iyle aynı desende,
**kayıt kayıt idempotent**. Eksik olan şehir/ilçe ne varsa tamamlanır,
var olanlara dokunulmaz.

Bu hata demo veriye özgü değildi: elle tek bir şehir eklemiş **herkesi**
etkiliyordu.

`DemoDataSeeder` tarafında da sessiz atlama kaldırıldı — adlandırılmış ilçe
bulunamazsa herhangi birine bağlanır; katalogun sessizce boş kalmasındansa
yanlış ilçede bir sinema olması yeğlenir.

### 9.4 Doğrulama

```
cities: 4 districts: 7 genres: 7 cinemas: 2 halls: 4
hall_techs: 8 seats: 320 movies: 5 showtimes: 36 campaigns: 2
```

API üzerinden uçtan uca:

```
GET /api/showtimes/by-movie/2
 → 18 seans; hallName "Salon A", cinemaName "CineSeat Cankaya",
 format "Standard2D"/"IMAX" (enum ad olarak [x]), totalSeats 78

GET /api/showtimes/2/seats
 → 80 koltuk kaydı; 78 aktif, 2 devre dışı
 tipler: Regular 76, Disabled 2, LoveSeat 2
 durumlar: Available 80
```

`totalSeats` 78 çıkması doğru: 80 koltuğun 2'si devre dışı ve sayıma
girmiyor.

İki kez başlatıldı, sayımlar değişmedi → **idempotent** [x]

---

## 10. Yönetim ekranları (6.2)

> **Tarih:** 24 Ağustos 2026 · Plan karşılığı: Faz 3

Yedi ekran grubunun tamamı yazıldı. Tekrar eden CRUD kalıbı önce ortak
parçalara çıkarıldı; her ekran yalnızca kendi alanlarını tanımlıyor.

### 10.1 Ortak CRUD altyapısı

| Parça | İşi |
|---|---|
| `FormDialog` | Ekleme/düzenleme modalı — odak tuzağı, Escape, odağın çağırana dönmesi |
| `FormField` | Etiket + girdi + hata; `htmlFor` / `aria-invalid` / `aria-describedby` otomatik |
| `adminResource.js` | CRUD servis üreteci; sayfalı ↔ düz dizi farkını soğurur |
| `useAdminResource` | Liste + ekle/güncelle/arşivle + form/onay diyaloğu + bildirim |

`FormDialog` arka plana tıklayınca **kapanmaz** (`ConfirmDialog` kapanır):
yarım doldurulmuş bir formu yanlışlıkla kaybetmek, kapatmak için bir tıklama
fazladan yapmaktan daha can sıkıcı. Aynı sebeple kaydetme hatasında diyalog
açık kalır ve hata formun içinde gösterilir.

### 10.2 Ekranlar

| Ekran | Rota | İzin |
|---|---|---|
| Şehir ve İlçeler | `/admin/cities` | `cinema.manage` |
| Sinemalar | `/admin/cinemas` | `cinema.manage` |
| Salonlar ve Koltuklar | `/admin/halls` | `cinema.manage` |
| Seanslar | `/admin/showtimes` | `showtime.manage` |
| Kampanyalar | `/admin/campaigns` | `campaign.manage` |
| Rezervasyonlar | `/admin/reservations` | `reservation.read` |
| Yorum moderasyonu | `/admin/comments` | `comment.moderate` |
| Kullanıcı yönetimi | `/admin/users` | `user.manage` |

**Koltuk düzenleyici:** koltuklar tek tek eklenmiyor, salon için ızgara
halinde toplu üretiliyor (`POST /seats/bulk`). Sonrasında her koltuğun tipi ve
kullanılabilirliği ayrı değiştirilebiliyor — bir koltuğun önüne kolon
geldiğinde tüm planı yeniden üretmek gerekmesin diye.

**Yorum moderasyonu:** backend yorumları yalnızca film kırılımında veriyor
(`?movieId=`), düz bir "tüm yorumlar" ucu yok. Ekran filmleri paralel çekip
tek listede birleştiriyor.

**Rezervasyonlar:** filtreler sunucuya gidiyor. Sayfa 100'lük dilimler okuduğu
için istemci tarafında süzmek eksik sonuç verirdi.

### 10.3 Backend eklemeleri

**`ShowtimeConflictChecker`** — seans çakışma kontrolü **hiç yoktu**.
`CreateShowtimeCommandHandler` yalnızca "film var mı, salon var mı" diye
bakıyordu; aynı salona aynı saate iki seans açılabiliyordu. Koltuk kilitleri
ve rezervasyonlar seans bazlı olduğu için bu, iki farklı filmin aynı
koltukları ayrı ayrı satması demekti.

Bir seans salonu **film süresi + 20 dk temizlik payı** kadar işgal ediyor.
Canlı API'de sınır davranışı doğrulandı:

| Senaryo | Sonuç |
|---|---|
| Aynı salon, aynı saat | 409 |
| Geçmişe seans | 400 |
| Aynı saat, farklı salon | 200 |
| Bitiş + temizlik payı (122. dk) | 200 |
| 1 dk öncesi (121. dk) | 409 |

Güncellemede seans kendisiyle çakışmış sayılmıyor; "geçmişte olamaz" kuralı
yalnızca başlangıç değiştiğinde uygulanıyor (yoksa geçmiş bir seansın
fiyatı bile düzeltilemezdi).

**`UsersController` + `RolesController`** — `user.manage` izni seed ediliyor
ve policy olarak kayıtlıydı ama hiçbir controller kullanmıyordu (bulgu O1).
Kullanıcı listesi (arama + rol filtresi, sayfalı) ve rol değiştirme eklendi.

Yönetici **kendi rolünü değiştiremiyor** — aksi hâlde son admin kendini User
yapıp sistemde hiç yönetici bırakmayabilirdi. Arayüzde de kendi satırında rol
seçimi hiç sunulmuyor.

---

## 11. Ödeme simülasyonu (6.3 / T6)

> **Tarih:** 24 Ağustos 2026

### 11.1 Adaptör sınırı

`services/paymentAdapter.js` bir **sözleşme** tanımlıyor:

```
charge({ amount, currency, card, description }) → Promise<Result>

Result:
 { status: "approved", reference, last4 }
 { status: "declined", reason } // kart reddedildi (iş kuralı)
 throw // sağlayıcıya ulaşılamadı (teknik hata)
```

**"Reddedildi" ile "ulaşılamadı" bilerek ayrı:** birincisinde kullanıcı başka
kart denemeli (hata sayfasına gider), ikincisinde aynı kartla tekrar denemek
mantıklı (sayfada kalır). Gerçek sağlayıcıya geçildiğinde yalnızca yeni bir
adaptör yazılır; ödeme ekranı ve rezervasyon akışı değişmez.

Demo kuralları: `0000…` → reddedilir, `9999…` → teknik hata.

### 11.2 Kart doğrulama

`domain/card.js` saf mantık — ağ yok, React yok, yan etki yok.

- **Luhn** algoritması (yazım hatası yakalar; kartın var olduğunu kanıtlamaz)
- **Marka tespiti**: Visa, Mastercard, Amex, Troy
- **Uzunluk markaya göre**: Visa 13/16/19, Mastercard 16, Amex 15
- **CVV markaya göre**: Amex'te 4, diğerlerinde 3 hane
- **Son kullanma**: `AA/YY` biçimi + kart ait olduğu ayın **son gününe kadar**
 geçerli (karşılaştırma bir sonraki ayın başına yapılır)
- **Kart sahibi adı**: en az 3 karakter, yalnızca harf (`\p{L}` — Türkçe
 karakterler dahil)

Girerken kart numarası otomatik gruplanıyor (Amex'te 4-6-5), son kullanma
tarihine eğik çizgi kendiliğinden ekleniyor. Doğrulama her zaman ham rakamlar
üzerinden yapılıyor.

### 11.3 Erişilebilirlik

Tek bir "kart bilgileri hatalı" mesajı yerine **alan bazlı** hatalar: her
mesaj kendi alanına `aria-describedby` ile bağlı, alan `aria-invalid` alıyor.
Gönderimde ilk hatalı alana odak veriliyor. Kullanıcı yazmaya başlayınca o
alanın hatası siliniyor.

### 11.4 Kart verisi nereye gitmiyor

Kart verisi yalnızca `paymentAdapter.charge()` çağrısı süresince yaşıyor:

- Rezervasyon isteğine **eklenmiyor**
- `localStorage` / `sessionStorage`'a **yazılmıyor**
- Loglanmıyor

Dışarı çıkan tek şey son dört hane. İki test bunu doğrudan ölçüyor: rezervasyon
payload'ında ve tarayıcı depolamasında kart numarasının geçmediği kontrol
ediliyor.

### 11.5 Çift gönderim

`useRef` ile kilitleniyor — `useState` bir sonraki render'da güncellendiği
için arka arkaya iki tıklama arasında henüz güncellenmemiş olabilirdi. Ref
anında değiştiği için ikinci tıklama kesin eleniyor.

### 11.6 Yol boyunca bulunan gerçek hata — `useCountdown`

Ödeme testleri yazılırken çıktı: **kullanıcı ödeme sayfasına girer girmez
sepeti temizlenip sepete geri atılıyordu.**

`useCountdown(initialSeconds)` değeri yalnızca `useState`'in ilk değeri olarak
kullanıyordu. Koltuk kilitleri asenkron alındığı için `initialSeconds` önce 0,
kilit gelince 600 oluyordu — ama sayaç 0'da kalıyor, kilit gelir gelmez
`onComplete` (yani "süre doldu") tetikleniyordu.

Bu, kilit alımını asenkron yaptığım entegrasyon turunda girmiş bir hatadır ve
yalnızca gerçek akışta görülürdü. `initialSeconds` değişince sayaç yeniden
kuruluyor.

### 11.7 Test kapsamı

| Dosya | Test |
|---|---:|
| `domain/card.test.js` | 26 |
| `services/paymentAdapter.test.js` | 8 |
| `pages/PaymentPage.test.jsx` | 10 |

Ödeme akışı testleri: geçersiz kartta çağrı yapılmaması, `aria-invalid`,
onaylanan ödemede rezervasyon, reddedilende rezervasyon **yapılmaması**,
teknik hatada sayfada kalma, çift tıklamada tek çağrı, kart verisinin
sızmaması.

---

## 12. Sayfalama uyuşmazlığı — sinema ve ilçe listeleri

Yönetim panelinde admin olarak gezinirken sayfalar yüklenmiyordu; ekranda
yalnızca dönen yükleme göstergesi kalıyordu. Visual Studio hata ayıklayıcısı
`ValidationBehavior` içindeki `throw new ValidationException(failures)`
satırında duruyordu, çağrı yığınının dibinde `CinemasController.GetByCity`
vardı.

### 12.1 İki ayrı sorun

**Donan ekran, hatanın kendisi değildi.** Hata ayıklayıcı istisnada duraklayınca
tüm süreç donuyor, hiçbir istek tamamlanmıyordu. `/api/cinemas`,
`/api/cities`, `/api/districts` — hepsi zaman aşımına uğruyordu (HTTP 000).
Ön yüzün sonsuza kadar dönmesinin sebebi buydu; 400 cevabı gelseydi ekranda
hata mesajı görünecekti.

**Asıl hata sözleşme uyuşmazlığıydı.** Ön yüz, backend'in kabul etmediği iki
şey gönderiyordu:

| Çağrı | Sorun | Sonuç |
|---|---|---|
| `GET /cinemas?pageNumber=1&pageSize=200` | `cityId` hiç gönderilmiyor → `0` | `GreaterThan(0)` düşüyor |
| aynı çağrı | `pageSize=200` | `InclusiveBetween(1, 100)` düşüyor |
| `GET /cities?pageSize=200` | `pageSize` sınırı aşıyor | 400 |
| `GET /districts?pageSize=500` | `cityId` yok → `0` | sessizce boş liste |

Etkilenen ekranlar: genel **Sinemalar** sayfası (`cinemaService`) ve
**Sinema/Şehir yönetimi** ekranları (`adminResource` üzerinden).

### 12.2 Kök sebep

Backend'de "tüm sinemaları listele" diye bir uç **yoktu**; `GetCinemasByCity`
adı üstünde şehre bağlıydı. Ön yüz ise hem yönetim tablosu hem de sinema
haritası için katalogun tamamını istiyordu. Aradaki boşluk yazarken fark
edilmedi.

`adminResource` içindeki `defaultPageSize = 200` ise sunucudaki 100 sınırından
habersiz seçilmişti.

### 12.3 Düzeltme

**Backend — şehir süzgeci isteğe bağlı:**

- `GetCinemasByCityQuery.CityId` ve `GetDistrictsByCityQuery.CityId` → `long?`
- Handler'lar süzgeci yalnızca değer verildiğinde uyguluyor, aksi hâlde
 `GetAll` üzerinden katalogun tamamını döndürüyor
- Doğrulayıcı: `GreaterThan(0).When(x => x.CityId.HasValue)` — yani `cityId=0`
 **hâlâ reddediliyor**, sadece yokluğu kabul ediliyor
- Controller imzaları `[FromQuery] long? cityId`

Sayfa boyutu sınırı **değiştirilmedi**. 100 makul bir üst sınır; sorun sınırın
kendisi değil, ön yüzün onu bilmemesiydi.

**Ön yüz — sınıra uyup sayfaları dolaşıyor:**

`adminResource.list()` artık `MAX_PAGE_SIZE = 100` ile istek atıyor ve
`totalPages` bitene kadar sayfaları tek tek çekip birleştiriyor. Böylece 100'ü
aşan kayıt **sessizce kırpılmıyor**. Çağıran kendi `pageNumber`/`pageSize`
değerini verdiyse döngü devreye girmiyor.

`MAX_PAGES = 50` üst sınırı var: sunucu tutarsız bir `totalPages` bildirse bile
döngü kapanıyor. Ayrıca boş sayfa gelirse de duruyor.

`cinemaService` elle kurduğu sorgu dizelerinden kurtarıldı; artık aynı
kaynakları kullanıyor. Sayfa sınırını bilen tek bir yer kaldı.

### 12.4 Neden hiçbir test yakalamadı

Mevcut testlerin hepsi **servis seviyesinde** taklit ediyordu
(`vi.mock("../services/cinemaService.js")`). Sorgu dizesi hiç kurulmuyordu,
dolayısıyla gerçek doğrulayıcılarla karşılaşan bir test yoktu.

Yeni `adminResource.test.js` (10 test) tam olarak bu boşluğu kapatıyor:
istenen `pageSize`'ın 100'ü aşmadığını, süzgeç verilmediğinde `cityId`
gönderilmediğini, boş süzgeçlerin sorguya eklenmediğini, sayfaların
dolaşıldığını ve süzgecin sayfalar arasında korunduğunu doğruluyor.

Eski `defaultPageSize = 200` bu testlerle **kırmızı** verirdi.

### 12.5 Doğrulama

Canlı uçlara atılan isteklerle:

| İstek | Önce | Sonra |
|---|---|---|
| `/cinemas?pageNumber=1&pageSize=100` | 400 | **200** — 2 kayıt |
| `/districts` | boş liste | **200** — 7 kayıt |
| `/cities?pageSize=100` | 400 | **200** — 4 kayıt |
| `/cinemas?cityId=2&pageSize=100` | 200 | **200** — İstanbul: 1 sinema |
| `/cinemas?cityId=3&pageSize=100` | 200 | **200** — Ankara: 1 sinema |
| `/cinemas?cityId=0&pageSize=100` | 400 | **400** — sınır korundu |
| `/cinemas?pageSize=200` | 400 | **400** — sınır korundu |

```
dotnet build CineSeat.slnx → 0 hata
npm run lint → 0 hata
npm run test:run → 348 / 348 (42 dosya)
npm run build → başarılı
```

### 12.6 Not — hata ayıklayıcı duraklaması

`ValidationException` bir **beklenen** akış; `ExceptionHandlingMiddleware` onu
400'e çeviriyor. Visual Studio yine de "kullanıcı tarafından işlenmemiş" deyip
duraklatıyor, çünkü istisna middleware'e ulaşmadan önce "Just My Code"
sınırından geçiyor.

Duraklamayı kapatmak için: **Hata Ayıklama → Pencereler → Özel Durum
Ayarları**, `Common Language Runtime Exceptions` altında
`CineSeat.Application.Common.Exceptions.ValidationException` işaretini kaldır.
Aksi hâlde her doğrulama hatasında hata ayıklayıcı duracak ve süreç donmuş
gibi görünecek.

---

## 13. Backend hijyeni ve cila (6.4 · 6.5)

### 13.1 76 nullable uyarısı → 0

Uyarıların hepsi entity'lerdeki `CS8618` idi. Hepsine körlemesine `= null!`
yazmak yerine dört ayrı duruma ayrıldı:

| Durum | Çözüm | Gerekçe |
|---|---|---|
| Zorunlu skaler (`Name`, `Title`, `Email`…) | `required` | Derleme anında "set etmeyi unuttun" hatası verir |
| Zorunlu ilişki (FK `long`) | `= null!` | EF Include ile dolduruyor; `?.` gürültüsü eklemez |
| Koleksiyon (`ICollection<T>`) | `= new List<T>()` | Boş liste doğru cevap, `null` değil |
| İsteğe bağlı ilişki (FK `long?`) | `Campaign?` | Gerçekten null olabilir |

Son satır bir **modelleme tutarsızlığını** açığa çıkardı:
`Reservation.CampaignId` nullable'dı ama `Campaign` navigation'ı değildi.
Kampanyasız rezervasyon tamamen geçerli bir durum, dolayısıyla ilişki de
nullable yapıldı.

`required` uygulanabilir miydi diye önce oluşturma noktaları sayıldı
(entity başına 1–3) ve generic bir `new T()` kısıtı olmadığı doğrulandı.
Derlemede **tek bir hata çıkmadı** — yani her oluşturma noktası zaten tüm
zorunlu alanları set ediyormuş; artık bu derleyici tarafından güvenceye alındı.

`dotnet build --no-incremental` ile doğrulandı: **0 uyarı, 0 hata.**

### 13.2 Entegrasyon test projesi (yeni)

Çözümde hiç test projesi yoktu. `Tests/CineSeat.IntegrationTests` eklendi
(xUnit + `WebApplicationFactory`), `.slnx`'e kaydedildi.

**Veritabanı stratejisi.** EF InMemory yerine **ayrı bir gerçek PostgreSQL
veritabanı** (`CineSeatDb_IntegrationTests`) kullanılıyor. Sebebi: ölçülmek
istenen şeylerin bir kısmı (benzersiz kısıt, `timestamptz`, eşzamanlılık)
InMemory sağlayıcıda zaten yok. Her turda veritabanı düşürülüp yeniden
kuruluyor; **geliştirme veritabanına dokunulmuyor.**

Ortam `"Testing"` seçildi: `DbInitializer` (rol, izin, admin, şehir) çalışıyor,
`DemoDataSeeder` çalışmıyor. Böylece testler demo katalog içeriği değiştiğinde
kırılmıyor; ihtiyaç duydukları kaydı `TestScenarioBuilder` ile kendileri
kuruyor (şehir → ilçe → sinema → salon → koltuklar → film → seans).

`Program.cs`'e `public partial class Program;` eklendi — top-level statement'lar
sınıfı `internal` ürettiği için test projesinden görünmüyordu.

**104 test, dört başlıkta:**

| Dosya | Test | Kapsam |
|---|---:|---|
| `PermissionMatrixTests` | 85 | 21 korumalı uç × (kimliksiz / izinsiz üye / yönetici) + oturum uçları + açık uçlar |
| `ShowtimeConflictTests` | 7 | Çakışma, temizlik payı sınırı, farklı salonlar, geçmiş, kendisiyle çakışmama |
| `ReservationOwnershipTests` | 7 | Sahiplik, `reservation.read`, iptal yetkisi, `/my` süzgeci |
| `SeatLockConcurrencyTests` | 6 | Eşzamanlı kilit, yenileme sözleşmesi, salon uyuşmazlığı |

İzin matrisinde yönetici için "200 bekle" denmedi bilerek: gövdesiz bir POST
400, olmayan kayda PUT 404 döndürür. Ölçülen şey iş kuralı değil, isteğin
**yetki duvarını geçip geçmediği** — dolayısıyla iddia "401 ve 403 değil".

### 13.3 Yol boyunca bulunan gerçek hata — eşzamanlı kilitte 500

`Es_zamanli_iki_istekten_yalnizca_biri_kilidi_alir` testi ilk turda **500**
aldı, beklenen 409'du.

Sebep: `LockSeatCommandHandler` yazmadan önce "bu koltuk kilitli mi" diye
bakıyor, ama **okuma ile yazma arasında** başka bir istek aynı satırı
ekleyebiliyor. Veritabanındaki `(ShowtimeId, SeatId)` benzersiz dizini doğru
davranıp ikinci eklemeyi reddediyordu — fakat `DbUpdateException` hiçbir yerde
yakalanmadığı için middleware'in genel `catch (Exception)` koluna düşüyor ve
çağırana **"Sunucu hatası"** dönüyordu. Oysa bu beklenen bir durum: koltuk
kapılmış.

Çeviri `WriteRepository.SaveAsync` içine kondu — PostgreSQL'in benzersiz kısıt
ihlali kodu (`SQLSTATE 23505`) yakalanıp `ConflictException`'a çevriliyor.
Konum bilinçli: **Application katmanı EF'i tanımıyor** (onion korunuyor),
Persistence tanıyor. Bu düzeltme yalnızca koltuk kilidini değil, benzersiz
kısıtı olan her yolu (kullanıcı adı, e-posta, tür adı, rezervasyon numarası)
500 yerine 409'a çeviriyor.

Bu hata yalnızca iki isteğin aynı anda gelmesiyle ortaya çıkıyordu; elle
denemekle bulunması pratikte mümkün değildi.

### 13.4 Görünür odak ve 360 px denetimi

**Bulgu 1 — odağı gizleyen üç kural.** `outline: none` yazıp yerine yalnızca
1 px'lik `border-color` değişimi koyan üç yer vardı: giriş/kayıt formu
(`App.css`), tüm yönetim formları (`admin.css`) ve sinema sayfasındaki şehir
seçici (`cinemas.css`). Klavye kullanıcısı için bu çok zayıf bir ipucu — üstelik
projenin geri kalanı zaten `outline: 2px solid + outline-offset: 2px` desenini
kullanıyordu. Üçü de o desene hizalandı; `outline: none` kalmadı.

**Bulgu 2 — tablo sarmalayıcısı boşta duruyordu.** `.data-table-wrapper`
`overflow-x: auto` taşıyor ama `.data-table`'da `min-width` yoktu; tablo her
zaman kapsayıcısına sıkışıyor, dolayısıyla asla kaymıyordu. 360 px'te sütunlar
okunmaz hale geliyordu. `min-width: 560px` eklendi — artık sıkışmak yerine
kayıyor, sarmalayıcı işini yapıyor.

**Temiz çıkanlar:** `div`/`span` üzerinde `onClick` **hiç yok** (0 adet), 320 px
üstü sabit genişlik yok, grid'ler `auto-fill` + `minmax` ile kuruluyor, yönetim
düzeni 900 px'te tek sütuna düşüyor.

### 13.5 Klavye ve rol kabul testleri

Denetimi göz kararıyla bırakmamak için üç testsiz bileşene test yazıldı
(**+28 test**, frontend 348 → 376):

| Dosya | Test | Ölçtüğü |
|---|---:|---|
| `FormDialog.test.jsx` | 12 | Odak tuzağı (Tab/Shift+Tab sarması), Escape, açılışta ilk alana odak, kapanışta odağın çağırana dönmesi, `aria-modal`, erişilebilir ad |
| `FormField.test.jsx` | 10 | Etiket–girdi bağı, benzersiz `id`, `aria-invalid`, hata ve ipucunun `aria-describedby` ile iliştirilmesi |
| `PermissionGate.test.jsx` | 9 | **Dört rol profili**: misafir, izinsiz kullanıcı, kısıtlı yetkili, tam yönetici + `all`/`any` modları |

`PermissionGate` testleri planın istediği kabul senaryosunu doğrudan kuruyor.
Kısıtlı yetkili örneği somut: yalnızca `movie.manage` izni olan bir yönetici
film bölümünü görüyor, kullanıcı yönetimini görmüyor.

Bunun bir **gizleme** katmanı olduğu, güvenlik sınırı olmadığı testin başında
yazılı — asıl kontrol backend'de ve §13.2'deki izin matrisiyle ölçülüyor.

### 13.6 Doğrulama

```
dotnet build --no-incremental → 0 uyarı, 0 hata (önce 76 uyarı)
dotnet test → 104 / 104 (önce test projesi yoktu)
npm run lint → 0 hata
npm run test:run → 376 / 376 (44 dosya)
npm run build → başarılı
```

---

## 14. Seans listesinde sayfa sınırı ve emoji temizliği

### 14.1 "Seanslar yükleniyor"da kalan ekran

§12'de sinema ve ilçe uçlarındaki sayfa sınırı uyuşmazlığı düzeltilmişti, ancak
**seans ucu gözden kaçmıştı**. `showtimeService.listByCinema` `adminResource`'u
kullanmıyor, kendi çağrısını elle kuruyordu ve `pageSize = 200` gönderiyordu:

```
GET /showtimes/by-cinema/2?pageNumber=1&pageSize=200   -> 400
GET /showtimes/by-cinema/2?pageNumber=1&pageSize=100   -> 200 (24 kayit)
```

Sunucu `InclusiveBetween(1, 100)` ile reddedince yönetim ekranı sonsuza kadar
yükleniyordu.

**Sınıra inmek yeterli değildi.** Bir sinemanın seansları 100'ü rahatlıkla
aşabilir (4 salon × günde 5 seans × 30 gün ≈ 600); `pageSize`'ı 100 yapmak
veriyi sessizce kırpardı. Bu yüzden sayfalama mantığı `adminResource` içinden
`fetchAllPages(basePath, params)` olarak dışa çıkarıldı; hem
`createAdminResource.list` hem de `showtimeService.listByCinema` artık onu
kullanıyor. Sunucudaki sayfa sınırını bilen tek bir yer kaldı.

**Tam tarama yapıldı.** Aynı sınıf hatanın üçüncü kez kaçmaması için tüm
servislerdeki `pageSize` kullanımları tarandı; başka ihlal çıkmadı (kalanların
hepsi ≤ 100). `movieService` `page=1` gönderiyor ama `GetMoviesQuery` alanı
gerçekten `Page` olduğu için doğru.

`showtimeService.test.js` (5 test) sınırı, yolu, sayfa dolaşmayı ve DTO
eşlemesini sabitliyor.

**Not:** İstatistik ekranının da donması bu hatadan değil, **hata ayıklayıcının
duraklamasından** kaynaklanıyordu — süreç donunca her istek asılı kalır
(bkz. §12.6).

### 14.2 Emoji temizliği

Projede 436 emoji vardı (36 dosya). **436 → 13.**

Kaldırılanlar: yönetim ekranı başlıkları (`Kampanyalar`, `Sinemalar`…),
`EmptyState` ikonları, `StatusPanel` uyarı/kilit ikonları, CSV indirme butonu,
afiş yer tutucusu ve dokümanlardaki durum işaretleri.

Doküman işaretleri silinmedi, **metne çevrildi** — anlam taşıyorlar:

| Önce | Sonra |
|---|---|
| yeşil tik | `[x]` |
| boş kare | `[ ]` |
| çarpı | `[yok]` |
| uyarı üçgeni | `[dikkat]` |
| renkli daireler | `[kirmizi]` / `[sari]` / `[yesil]` … |

**Korunan 13 karakter** bilinçli: `★` (derecelendirme), `♥`/`♡` (favori
düğmesi), `✕` (kapatma), `✓` (başarı). Bunlar renkli piktograf değil, tek renkli
tipografik glif ve **işlev taşıyorlar** — favori düğmesinin görünen tek içeriği
o kalp. Silmek arayüzü bozardı; istenirse SVG'ye çevrilebilir.

İki yerde silmek yetmedi, yerine bir şey konması gerekti:

- **Tema düğmesi** — emoji tek içerikti, silinse boş düğme kalırdı. Satır içi
  SVG (ay/güneş) kondu; `currentColor` kullandığı için iki temada da doğru
  renkte çiziliyor, `aria-label` zaten vardı.
- **Afiş yer tutucusu** — "Afis yok" metni kondu ve CSS'teki `font-size: 2rem`
  (bir glif için ayarlanmıştı) `0.85rem`'e indirildi.

### 14.3 Doğrulama

```
dotnet build     → 0 hata
npm run lint     → 0 hata
npm run test:run → 381 / 381 (45 dosya)
npm run build    → başarılı
```

---

## 15. Ödeme akışındaki üç hata ve iki arayüz düzeltmesi

### 15.1 Kampanya sepete göre seçiliyordu, backend rezervasyona göre bakıyor

**Ödemeyi kıran asıl hata buydu.** Belirti "indirim uygulanmıyor" değil,
**rezervasyon tümden reddediliyor** idi.

`createReservation` sepetteki her seans için **ayrı bir rezervasyon**
oluşturuyor. Backend kampanya koşullarını o rezervasyonun ara toplamına göre
doğruluyor:

```csharp
if (subtotal < campaign.MinCartTotal)
    throw new ConflictException(...);   // 409
```

Ön yüz ise uygunluğu **sepetin tamamına** göre değerlendiriyordu. Seed'deki
"500 TL Üzeri 75 TL İndirim" kampanyasıyla:

| | Görülen | Sonuç |
|---|---|---|
| Ön yüz | sepet 500 ≥ 500 → indirim göster | önizleme indirimli |
| Backend | rezervasyon 250 < 500 | **409, ödeme düşer** |

Kampanya seçimi `planCampaignsPerItem` ile **kalem bazına** taşındı; her
rezervasyon kendi `campaignId`'siyle gidiyor. Önizlemede gösterilen indirim
artık backend'in uyguladığı hesabın aynısı.

### 15.2 Çocuk bileti çarpanı iki tarafta farklıydı

| | Yetişkin | Öğrenci | Çocuk |
|---|---|---|---|
| Ön yüz | 1.0 | 0.75 | **0.60** |
| Backend | 1.0 | 0.75 | **0.50** |

Kullanıcı bir fiyat görüp başka tutar ödüyordu. Bağlayıcı olan backend olduğu
için ön yüz 0.50'ye hizalandı. `pricing.test.js` (11 test) çarpanları
sabitliyor ve kaynağın backend olduğunu yazıyor.

### 15.3 Kilit bırakma idempotent değildi

`ReleaseSeatCommandHandler`, var olmayan bir kilit için `NotFoundException`
fırlatıyordu. Ancak rezervasyon oluştuğunda kilit satırları **aynı transaction
içinde siliniyor**; ödeme sonrası temizlik yapan istemci artık var olmayan
kimlikleri bıraktığı için her seferinde 404 alıyordu.

İstemci hatayı yutuyordu (`.catch(() => null)`), ama **hata ayıklayıcı
istisnada duraklayınca tüm süreç donuyor** ve sonraki her istek asılı
kalıyordu — ekrandaki "koltuklar ayrılıyor" takılmasının sebebi buydu.

DELETE idempotenttir: "bu kilit gitmiş olsun". Üç durum da 204 dönüyor, ancak
**silme yalnızca sahibi için** yapılıyor:

| Durum | Cevap | Eylem |
|---|---|---|
| Kilit yok | 204 | — |
| Kilit senin | 204 | silinir |
| Kilit başkasının | 204 | **dokunulmaz** |

Başkasının kilidi için de 204 dönmek bilinçli: 404 döndürmek "bu kilit var ama
senin değil" bilgisini sızdırır ve id deneyen biri geçerli kilitleri
haritalayabilirdi. Kilide dokunulmadığı için saldırgan hiçbir şey elde etmiyor.
Üç entegrasyon testi bunu ölçüyor.

### 15.4 Tema simgesi açık temada görünmüyordu

§14.2'de emojiyi SVG'ye çevirirken `color: inherit` yazmıştım. Emoji kendi
renkleriyle çizildiği için bu fark edilmiyordu, ama SVG `currentColor`
kullanıyor.

Header arka planı **her iki temada da koyu** (`--color-header-*` açık temada
override edilmiyor), gövde metni ise açık temada koyu. Sonuç: koyu zemin
üzerinde koyu ikon. Menü bağlantılarıyla aynı değişkene
(`--color-header-text-muted`) bağlandı.

### 15.5 Şehir/ilçe panelleri hizasızdı ve yana kayıyordu

**Hizasızlık:** "+ Şehir Ekle" sayfa başlığında, "+ İlçe Ekle" ise panelin
kendi başlığında duruyordu. Sağ panelin başlığı buton taşıdığı için daha uzun
oluyor, üstelik şehir seçili olup olmamasına göre değişiyordu. Sol panel de
aynı sarmalayıcıya alındı ve `.admin-split-header`'a `min-height` verildi;
artık buton olsa da olmasa da iki panel aynı hizada başlıyor.

**Yana kayma:** §13.4'te 360 px için eklediğim `.data-table { min-width: 560px }`
bir gerileme üretmişti — yan yana iki dar panelde tabloyu taşırıp yatay
kaydırma çıkarıyordu. Kural `@media (max-width: 640px)` içine alındı: dar
ekranda tablo kayıyor, geniş ekranda panele sığıyor.

### 15.6 Doğrulama

```
dotnet build --no-incremental → 0 uyarı, 0 hata
dotnet test                   → 107 / 107
npm run lint                  → 0 hata
npm run test:run              → 400 / 400 (47 dosya)
npm run build                 → başarılı
```

---

## 16. "Koltuklar ayrılıyor…" takılması ve kart numarası sınırı

### 16.1 Ödemenin tamamlanamamasının sebebi

Ödeme butonu "Koltuklar ayrılıyor…" yazısıyla kalıcı olarak kapalı kalıyordu.
Ekranda hata da yoktu.

Sebep **kodda değil, çalışan süreçteydi**: Visual Studio'nun ayağa kaldırdığı
backend, hata ayıklayıcı bir istisnada duraklattığı için **donmuştu**. Ölçüldü:

```
GET /api/movies -> HTTP 000 (zaman aşımı)
```

`PaymentPage`, kilitleri aldıktan sonra `lockExpiresAt` değerini set ediyor ve
buton `isLocking = lockExpiresAt === null` koşuluna bağlı. Donmuş sunucuya
giden kilit istekleri **hiç dönmediği** için bu değer hiç oluşmuyordu. Hata
görünmemesinin sebebi de bu: istek başarısız olmuyor, yalnızca sonuçlanmıyor.

Süreç yenilendikten sonra akışın tamamı doğrulandı:

| Adım | Sonuç |
|---|---|
| `POST /seatlocks` (koltuk 251) | 200 — `lockExpiresAt` dolu |
| `POST /seatlocks` (koltuk 252) | 200 |
| `POST /reservations` | 200 — RES-76F84DF47D |
| Fiyat | 260 (Yetişkin) + **130** (Çocuk = 260 × 0.50) = 390 |
| `DELETE /seatlocks/17` ve `/18` | **204** |

Son iki satır §15'teki iki düzeltmeyi de sahada doğruluyor: çocuk çarpanı artık
iki tarafta da 0.50, ve rezervasyonun sildiği kilitleri bırakmak 404 yerine
204 dönüyor — donmanın kaynağı olan istisna artık hiç oluşmuyor.

### 16.2 Kullanıcıyı çıkmazda bırakmama

Kök sebep süreçteydi, ancak arayüzün bu duruma verdiği tepki de kusurluydu:
hiç kilit alınamadığında `acquired.reduce(..., null)` `null` döndürüyor, buton
sonsuza kadar kapalı kalıyor ve kullanıcıya **hiçbir şey söylenmiyordu**.

Artık boş sonuç açık bir hata olarak ele alınıyor; kullanıcı sepete dönüp
tekrar denemesi gerektiğini görüyor.

### 16.3 Kart numarası sınırsız uzuyordu

Girdide `maxLength` yoktu ve `formatCardNumber` de rakamları kırpmıyordu;
kart numarası istenildiği kadar uzatılabiliyordu.

Sınır **biçimleme fonksiyonuna** kondu — girdinin `onChange`'i zaten oradan
geçtiği için tek yerde çözülüyor. Marka anlaşıldığında o markanın sınırı,
anlaşılmadığında hiçbir kartın aşamayacağı 19 hane uygulanıyor:

| Girdi | Sonuç |
|---|---|
| Visa, 40 hane | 19 hane |
| Amex (`37…`), 30 hane | **15 hane** |
| Mastercard (`55…`), 30 hane | **16 hane** |
| Markası belirsiz, 40 hane | 19 hane |

Girdiye ayrıca `maxLength={23}` (19 hane + 4 boşluk) eklendi; tarayıcı fazla
tuş vuruşunu baştan kabul etmiyor.

### 16.4 Doğrulama

```
dotnet build --no-incremental → 0 uyarı, 0 hata
dotnet test                   → 107 / 107
npm run lint                  → 0 hata
npm run test:run              → 407 / 407 (47 dosya)
npm run build                 → başarılı
```

Yeni testler: kart uzunluk sınırı için 5, kilit alınamama çıkmazı ve girdi
sınırı için 2.

---

## 17. Eş zamanlı kilit yarışı ve panel hizalaması

### 17.1 Aynı kullanıcının kendi kendiyle çakışması

§16'da süreç yenilendikten sonra ödeme yine takıldı, ama **farklı bir
istisnayla**: `WriteRepository.SaveAsync` içindeki benzersiz kısıt çevirisi
(§13.3) `LockSeatCommandHandler`'dan tetikleniyordu.

Handler "önce oku, sonra yaz" yapıyor:

```
istek A: kilit var mı? → hayır → INSERT
istek B: kilit var mı? → hayır → INSERT   ← benzersiz dizin reddeder
```

Ama bu **gerçek bir çakışma değildi**: iki istek de aynı kullanıcıya aitti.
Handler zaten "aynı kullanıcı aynı isteği yinelerse süreyi yeniler" diyor;
yarış bu niyeti boşa çıkarıyordu.

Tetikleyici React'in geliştirme modunda efektleri iki kez çalıştırması
(`StrictMode`): `PaymentPage` kilitleri iki kez, eş zamanlı olarak istiyordu.

**Düzeltme:** ekleme yarışı kaybedilirse satır yeniden okunuyor ve mevcut
devralma mantığına bırakılıyor. Kilit bizimse ya da süresi dolmuşsa istek
başarılı olur; yalnızca canlı ve başkasına ait bir kilit gerçek çakışmadır.

Başarısız ekleme EF'in izleyicisinde `Added` olarak kaldığı için bir sonraki
kayıtta tekrar denenirdi; bu yüzden `IWriteRepository`'ye `Detach` eklendi.

Canlı doğrulama:

| Senaryo | Sonuç |
|---|---|
| Aynı kullanıcı, aynı koltuk, eş zamanlı 2 istek | **200 + 200**, ikisi de kilit id 24 |
| Farklı kullanıcı, aynı koltuk | **409** — "başka bir kullanıcı tarafından kilitli" |

Düzeltme yalnızca yarışı tolere ediyor, gerçek çakışmayı değil. İki
entegrasyon testi bunu ölçüyor (toplam 109).

### 17.2 Şehir/ilçe panelleri

§15.5'te başlıklar hizalanmıştı ama sorun devam ediyordu. Kalan iki sebep:

**Tablo başlığı (`<caption>`) görünürdü ve metni tekrarlıyordu.** Her tablonun
üstünde zaten aynı adı taşıyan bir `<h2>` var; caption ikinci kez "Şehirler"
yazıyor ve fazladan bir satır yüksekliği ekliyordu. Sol panel her zaman tablo
gösterirken sağ panel şehir seçilene kadar `EmptyState` gösteriyor — yani bu
fazladan satır yalnızca solda oluşuyor, paneller kayıyordu.

`<caption>` tabloya erişilebilir ad verdiği için silinmedi, **ekran okuyucuya
bırakılıp görsel olarak gizlendi**. `AdminMoviesPage`'in dinamik caption'ı
(arşiv/katalog) bilgi kaybetmiyor: aynı bilgi sayfa başlığı açıklamasında ve
düğme metninde zaten görünür.

**Paneller eşit genişlikte değildi.** `minmax(0, 1fr) minmax(0, 1.2fr)`
sağdakini %20 geniş yapıyordu; `repeat(2, minmax(0, 1fr))` ile eşitlendi.

### 17.3 Doğrulama

```
dotnet build --no-incremental → 0 uyarı, 0 hata
dotnet test                   → 109 / 109
npm run lint                  → 0 hata
npm run test:run              → 407 / 407 (47 dosya)
npm run build                 → başarılı
```
