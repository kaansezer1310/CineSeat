# CineSeat Frontend — Karar Bekleyen Maddeler

> **Tarih:** Ağustos 2026
> **Amaç:** Frontend planının ilerlemesi için ekipçe karara bağlanması gereken konular.
> **İlgili belge:** Bulgular ve faz planı için → [`FRONTEND_DENETIM_VE_PLAN.md`](./FRONTEND_DENETIM_VE_PLAN.md)

Bu belgedeki maddeler **tek başına frontend kararı değil.** Çoğu backend'i,
bir kısmı ürün kapsamını ilgilendiriyor. Planın Faz 4'ü (entegrasyon)
bunlar netleşmeden başlayamaz.

---

## Öncelik özeti

| # | Konu | Kimi ilgilendiriyor | Aciliyet |
|---|---|---|---|
| **T1** | Film listesi tür bilgisi taşımalı mı? | Backend | Faz 4'ten önce |
| **T2** | Seans/koltuk modeli uyuşmazlığı | Backend + Frontend | Faz 4'ten önce |
| **T3** | Admin için "tüm rezervasyonlar" ucu yok | Backend | Faz 4'ten önce |
| **T4** | Admin panelinin kapsamı ne olacak? | Ürün / hepimiz | Faz 3'ten önce |
| **T5** | İzin (Permission) sistemi devreye girecek mi? | Backend | Faz 4 sonrası olabilir |
| **T6** | Ödeme gerçek mi, simülasyon mu? | Ürün / hepimiz | Faz 4'ten önce |
| **T7** | Silme işlemi kalıcı mı, işaretleme mi? | Backend | Faz 3'ten önce |
| **T8** | Rota dili: Türkçe mi İngilizce mi? | Frontend (ekip onayı) | Faz 1'de |
| **T9** | Sinemalar: sekme mi, ayrı sayfa mı? | Ürün | Faz 1'de |

---

## T1 · Film listesi tür bilgisi taşımalı mı?

### Durum
Ana sayfadaki **tür filtresi çalışmıyor.** Backend'in `MovieDto`'su tür bilgisi
içermiyor; türler ayrı bir uç noktadan geliyor (`GET /movies/{id}/genres`) ve
tekil değil, **liste** (bir filmin birden fazla türü olabilir).

Film listesinde her film için ayrı tür isteği atmak N+1 sorgu demek olacağından,
frontend şu an tür alanını boş bırakıyor:

```js
// movieService.js:52
genre: genres.length > 0 ? genres.join(", ") : ""
```

Film **detayında** tek ek istekle gerçek türler çekiliyor — orada sorun yok.
Sorun yalnızca liste ekranında.

### Seçenekler

| Seçenek | Artı | Eksi |
|---|---|---|
| **A.** `MovieDto`'ya tür listesi eklensin | Filtre çalışır, tek istek | Backend'de projeksiyon değişikliği |
| **B.** Ayrı bir `GET /movies/genres-map` ucu | Liste hafif kalır | İkinci istek, senkron tutma yükü |
| **C.** Tür filtresi kaldırılsın | Sıfır iş | Özellik kaybı, UI'dan kontrol silinir |

### Tavsiyem
**A.** `GetMoviesQueryHandler` zaten bir projeksiyon yapıyor; `MovieGenres`
üzerinden tür adlarını da seçmek EF tarafında tek `JOIN`. Maliyeti düşük,
kazancı doğrudan görünür bir özellik.

### Karar
> _(toplantıda doldurulacak)_

---

## T2 · Seans ve koltuk modeli uyuşmazlığı

### Durum
Frontend'in mock seans/koltuk modeli ile backend'in gerçek ilişkisel modeli
**birebir örtüşmüyor.** Frontend entegrasyonu sırasında Auth ve Movies
tamamlandı; Seats / Showtimes / Reservations bilinçli olarak ertelendi çünkü
bu, basit bir alan eşlemesi değil — model farkı.

Örnek fark: frontend koltukları `"A2"`, `"B5"` gibi **string kod** olarak
tutuyor; backend'de `Seat` ayrı bir entity, `SeatId` (long) ile ve `HallId`'ye
bağlı. Ayrıca backend'de frontend'de karşılığı olmayan bir `SeatLock`
(süreli koltuk kilidi) mekanizması var.

### Seçenekler

| Seçenek | Anlamı |
|---|---|
| **A.** Frontend backend'e uyarlanır | Mock model atılır, gerçek `SeatId`/`HallId` kullanılır. Koltuk seçim ekranı yeniden yazılır. |
| **B.** Backend frontend'e uyarlanır | Backend string koltuk kodu kabul eder. **Önerilmiyor** — veri bütünlüğünü zayıflatır, `SeatLock` benzersizlik kısıtı bozulur. |
| **C.** Araya bir uyum katmanı konur | `seatService` içinde çeviri yapılır. Kısa vadede hızlı, uzun vadede iki modeli birden taşıma yükü. |

### Tavsiyem
**A.** Backend'in modeli doğru kurulmuş (seans + koltuk benzersizlik kısıtı,
kilit mekanizması). Frontend'in mock modeli tasarım aşamasında uydurulmuş bir
basitleştirme; onu korumak için gerçek modeli bozmak yanlış olur.

Bu seçenek koltuk seçim ekranının yeniden yazılmasını gerektiriyor —
**Faz 4'ün süre tahmininin büyük kısmı bu.**

### Karar
> _(toplantıda doldurulacak)_

---

## T3 · Admin için "tüm rezervasyonlar" ucu yok

### Durum
Admin dashboard'un gerçek veriye bağlanabilmesi için tüm rezervasyonları
listeleyen bir uç nokta gerekiyor. **Böyle bir uç yok.**

`ReservationsController` şunları sunuyor:

```
GET  /api/reservations/my         → yalnızca giriş yapanın kendi rezervasyonları
GET  /api/reservations/{id}       → tek rezervasyon (sahiplik kontrollü)
POST /api/reservations            → oluştur
POST /api/reservations/{id}/cancel → iptal
```

Controller'ın tamamı `[Authorize]` ile korunuyor — **admin ayrımı yok.**
`Features/Reservations/Queries/` altında yalnızca `GetMyReservations` ve
`GetReservationById` var.

İlginç ayrıntı: `DbInitializer` **`reservation.read` iznini** ("Tüm
rezervasyonları görüntüleme") seed ediyor ve admin rolüne veriyor — ama bu izni
kullanan hiçbir uç nokta yok. Yani ihtiyaç öngörülmüş, karşılığı yazılmamış.

### Gereken
Yeni bir query + uç nokta:

```
GET /api/reservations  →  [Authorize(Roles = "Admin")]
                          sayfalama + tarih/film filtresi
                          PagedResult<ReservationSummaryDto>
```

Dashboard'un ihtiyaç duyduğu asgari alanlar: film adı, seans tarihi, bilet
adedi, tutar, durum.

### Kim yazacak?
> _(toplantıda doldurulacak — backend tarafında bir görev)_

---

## T4 · Admin panelinin kapsamı ne olacak?

### Durum
Backend'de **19 özellik modülü** var; admin panelinde **1 tanesinin** ekranı var.

| Backend modülü | Admin ekranı |
|---|---|
| Movies | ✅ Liste + form |
| Cinemas, Cities, Districts | ❌ Yok |
| Halls, Seats, Technologies, HallTechs | ❌ Yok |
| Showtimes | ❌ Yok |
| Campaigns | ❌ Yok |
| Genres, MovieGenres | ❌ Yok |
| Comments *(moderasyon)* | ❌ Yok |
| Reservations, Tickets | ❌ Yok |
| Users, Auth | ❌ Yok |

Yani bugün bir yönetici sinema ekleyemiyor, salon tanımlayamıyor, **seans
açamıyor**, kampanya yönetemiyor. Backend bunların hepsini destekliyor.

Özellikle **seans yönetimi** kritik: seans olmadan bilet satılamaz. Bugün
seanslar yalnızca mock veride var; gerçek veritabanında seans oluşturmanın
arayüzü yok.

### Karar gereken soru
Bu proje teslimi için admin panelinin kapsamı ne?

| Seçenek | İçerik | Tahmini ek süre |
|---|---|---|
| **A. Asgari** | Filmler *(mevcut)* + Seanslar | +2 gün |
| **B. Orta** | A + Sinema/Salon/Koltuk + Kampanyalar | +4–5 gün |
| **C. Tam** | B + Yorum moderasyonu + Kullanıcı yönetimi | +7–8 gün |

### Tavsiyem
**A**, en azından ilk teslim için. Seans yönetimi olmadan ürün uçtan uca
çalışmıyor; geri kalanı doğrudan veritabanından da yönetilebilir. B ve C
sonraki iterasyona bırakılabilir.

Bu karar **Faz 3'ün kapsamını doğrudan belirliyor** — planda Faz 3 şu an
yalnızca mevcut ekranların yeniden tasarımını içeriyor.

### Karar
> _(toplantıda doldurulacak)_

---

## T5 · İzin (Permission) sistemi devreye girecek mi?

### Durum
Backend'de tam bir izin altyapısı var: `Permission` ve `RolePermission`
tabloları, seed edilmiş 7 izin (`movie.manage`, `campaign.manage`,
`reservation.read`, `comment.moderate` …), admin rolüne hepsi bağlanmış.

Ama **hiçbir yerde kullanılmıyor.** Controller'lar rol bazlı çalışıyor:

```csharp
[Authorize(Roles = RoleNames.Admin)]   // kullanılan
// [Authorize(Policy = "movie.manage")] // kullanılmayan
```

Frontend de aynı şekilde yalnızca `role === "admin"` kontrolü yapıyor.

### Soru
İzin sistemi bu proje kapsamında devreye alınacak mı, yoksa ileriye dönük bir
altyapı olarak mı duracak?

- **Alınacaksa:** backend'de policy tanımları, frontend'de menü öğelerinin
  izne göre gizlenmesi gerekiyor. Örneğin yalnızca `campaign.manage` izni olan
  bir editör rolü tanımlanabilir.
- **Alınmayacaksa:** sorun yok, ama belgelerde "şu an kullanılmıyor" diye
  belirtilmeli ki kod okuyan yanılmasın.

### Tavsiyem
Bu teslim için **rol bazlı yeterli.** İzin tablolarını kaldırmaya da gerek yok
— ama kullanılmadığı yazılı olmalı.

### Karar
> _(toplantıda doldurulacak)_

---

## T6 · Ödeme gerçek mi, simülasyon mu?

### Durum
`PaymentPage` şu an tamamen sahte: kart bilgisi alıyor, hiçbir yere göndermiyor,
`localStorage`'a rezervasyon yazıp başarı sayfasına yönlendiriyor.

Backend'de de ödeme ile ilgili hiçbir şey yok — `Reservation` entity'sinde
`Status` alanı var (`Completed`, `Cancelled`) ama ödeme sağlayıcısı
entegrasyonu, işlem kaydı ya da tutar doğrulaması yok.

### Soru
Teslimde ödeme nasıl ele alınacak?

| Seçenek | Anlamı |
|---|---|
| **A. Simülasyon** *(açıkça belirtilmiş)* | Ekranda "demo ödeme" uyarısı, backend rezervasyonu doğrudan `Completed` yapar |
| **B. Gerçek sağlayıcı** | Iyzico/Stripe entegrasyonu — ciddi ek iş, PCI kapsamı, test kartları |

### Tavsiyem
**A.** Bir bitirme projesinde gerçek ödeme entegrasyonu, kazandırdığından çok
zaman götürür. Önemli olan, simülasyon olduğunun **arayüzde ve belgede açıkça
yazması** — jüri bunu eksik değil, bilinçli kapsam kararı olarak görür.

### Karar
> _(toplantıda doldurulacak)_

---

## T7 · Silme işlemi kalıcı mı, işaretleme mi?

### Durum
Backend'de yumuşak silme (soft delete) altyapısı **yarım kurulmuş**:

- ✅ `BaseEntity.IsDeleted` alanı var
- ✅ `ApplicationDbContext` her sorguya otomatik `WHERE is_deleted = false` ekliyor
- ❌ Ama kod tabanında `IsDeleted = true` atayan **tek bir satır bile yok**
- ❌ `WriteRepository.Remove()` hâlâ gerçek `DELETE` üretiyor

Yani okuma tarafı hazır, yazma tarafı bağlanmamış. Bugün admin panelinden bir
film silindiğinde kayıt **kalıcı olarak** gidiyor.

### Frontend'i neden ilgilendiriyor?
Admin panelindeki "Sil" butonunun ne yaptığı, kullanıcıya ne söyleyeceğimizi
belirliyor:

- Kalıcı silme ise → onay diyaloğu sert olmalı ("Bu işlem geri alınamaz")
- İşaretleme ise → "Arşivle" demek daha doğru, geri alma da sunulabilir

Ayrıca daha önce konuşulmuş bir gereksinim var: **arşivlenen film verisi
silinmemeli** (`movieService.test.js` içinde bu davranışı doğrulayan bir test
mevcut). Bugünkü kalıcı silme bu gereksinimle çelişiyor.

### Tavsiyem
Soft-delete'i tamamlamak: `WriteRepository.Remove()` `IsDeleted = true` atasın.
Küçük bir değişiklik, mevcut altyapıyı anlamlı kılıyor ve gereksinimle
uyumlu hâle getiriyor. Frontend'de buton "Arşivle" olur.

### Karar
> _(toplantıda doldurulacak)_

---

## T8 · Rota dili: Türkçe mi İngilizce mi?

### Durum
Rota adları iki dil arasında gidip geliyor:

```
Türkçe   → /odeme, /odeme-hata
İngilizce → /booking, /cart, /success, /movies, /cinemas, /profile
```

### Seçenekler
- **A.** Hepsi İngilizce → `/odeme` `/payment` olur *(2 rota değişir)*
- **B.** Hepsi Türkçe → 6 rota değişir, kod içinde daha çok dokunuş

Hangisi seçilirse seçilsin eski adreslerden yenisine yönlendirme bırakılmalı.

### Tavsiyem
**A.** Daha az değişiklik, kod içindeki değişken/bileşen adlarıyla da tutarlı
(`PaymentPage`, `CartPage` zaten İngilizce).

### Karar
> _(toplantıda doldurulacak — küçük madde, hızlı geçilebilir)_

---

## T9 · Sinemalar: sekme mi, ayrı sayfa mı?

### Durum
Aynı sayfa iki farklı yoldan erişilebilir durumda:

```
App.jsx:45      → <Route path="/cinemas" …>   ← menüde bağlantısı yok, ulaşılamıyor
HomePage.jsx:13 → import CinemasPage           ← ana sayfada sekme olarak
```

Sekmeye geçildiğinde adres değişmiyor: kullanıcı bağlantıyı paylaşamıyor,
tarayıcının geri tuşu beklendiği gibi çalışmıyor.

### Seçenekler
- **A.** Sekme kalsın, ama **URL'ye yansısın** (`/?sekme=sinemalar`) → paylaşılabilir olur, `/cinemas` rotası kaldırılır
- **B.** Sekme kaldırılsın, **ayrı sayfa** olsun → menüye "Sinemalar" bağlantısı eklenir

### Tavsiyem
**B.** Sinemalar listesi filmlerle aynı düzlemde bir içerik değil; ayrı bir
sayfa olarak daha net. Menüde de yerini alır, bugünkü "ulaşılamayan rota"
sorunu kendiliğinden çözülür.

### Karar
> _(toplantıda doldurulacak)_

---

## Toplantı için önerilen sıra

1. **T4** (admin kapsamı) — diğer her şeyin süresini etkiliyor, önce bu
2. **T2** (seans/koltuk modeli) — Faz 4'ün en büyük kalemi
3. **T6** (ödeme) — kapsamı netleştirir
4. **T1, T3, T7** — backend'de somut görevler doğuruyor
5. **T5, T8, T9** — hızlı geçilebilir, küçük maddeler

**Not:** T8 ve T9 dışındakiler backend tarafında iş doğuruyor. Bu maddeler
karara bağlanmadan Faz 4'e başlamak, sonradan atılacak kod yazmak anlamına
gelir. Faz 1–3 ise bu kararların hiçbirini beklemeden ilerleyebilir.
