# Code Review — tüm proje

Tarih: 25.08.2026 · Dal: `omer-cqrs-port`

Bu tur, ödeme akışındaki hataların ardından **projenin tamamına** yapılan
gözden geçirmedir. Bulguların her biri ya kodda ya da canlı uçlara atılan
isteklerle doğrulandı; tahmine dayanan madde yok.

---

## 1. Düzeltilenler

### 1.1 Sayfa boyutunda sınır eksikliği — DOĞRULANDI, DÜZELTİLDİ

Sayfalayan 10 uçtan **4'ünde** doğrulayıcı yoktu. Canlı ölçüm:

```
GET /api/movies?page=1&pageSize=999999      -> 200   (sinirsiz)
GET /api/comments?movieId=1&pageSize=999999 -> 200   (sinirsiz)
GET /api/cinemas?pageSize=999999            -> 400   (dogru davranis)
```

Tek istekle tablonun tamamı çekilebiliyordu. Etkilenenler: `GetMoviesQuery`,
`GetCommentsByMovieQuery`, `GetMyFavoritesQuery`, `GetUsersQuery`.

Dördüne de diğer uçlarla aynı sınır (`InclusiveBetween(1, 100)`) eklendi.
Ön yüzün bu uçlara gönderdiği değerler (100, 50, 100, 50) sınırın altında
olduğu için hiçbir şey kırılmadı.

`PaginationLimitTests` (17 test) sekiz ucun tamamında hem sınırı hem de
sınır içi isteğin kabul edildiğini ölçüyor.

---

## 2. Temiz çıkanlar

Bunlar **kontrol edildi ve sorun bulunmadı** — ileride tekrar bakmaya gerek
kalmasın diye kaydediliyor.

### 2.1 Yetkilendirme ve sahiplik

Sahiplik kontrolü gereken her handler doğru davranıyor:

| Handler | Kontrol |
|---|---|
| `GetTicketById` | Sahip değilse `NotFound` (varlığı sızdırmıyor) |
| `GetTicketsByReservation` | Rezervasyon sahipliği önce doğrulanıyor |
| `GetReservationById` | Sahip ya da `reservation.read` |
| `CancelReservation` | Sahip ya da `reservation.manage` |
| `DeleteComment` | Sahip ya da `comment.moderate` |
| `UpdateProfile` | Yalnızca token'daki kullanıcı |
| `ReleaseSeat` | Yalnızca sahip siler; cevap her durumda 204 |

`TicketsController` sınıf seviyesinde yalnızca `[Authorize]` taşıyor — ilk
bakışta IDOR riski gibi görünüyor, ancak **iki handler da sahipliği
doğruluyor**. Sorun yok.

### 2.2 Bağımlılık ömürleri

Dört singleton kaydı var (`ITokenService`, `IPasswordHasher`,
`AuditableEntityInterceptor`, `IAsyncQueryExecutor`). Dördü de **durumsuz**;
hiçbiri scoped bir `DbContext` yakalamıyor. Captive dependency yok.

### 2.3 DbContext oluşturma

`ApplicationDbContext`'in yalnızca `DbContextOptions` alan kurucusu var;
parametresiz kurucu ve elle `new ApplicationDbContext()` kullanımı yok.
Yapılandırılmamış bir bağlam oluşması mümkün değil.

### 2.4 Eşzamanlılık

60 eş zamanlı `POST /api/auth/login` isteği: **60/60 → 200**, log temiz.
Bağlantı havuzunda sızıntı ya da tükenme belirtisi yok.

---

## 3. Düzeltilmeyenler — bilinçli, önceliklendirilmiş

### 3.1 `CancellationToken` yaygın değil (48 / 84 uç)

Uçların çoğu `CancellationToken` almıyor; istemci bağlantıyı kesse bile sorgu
sonuna kadar çalışıyor. Doğruluk hatası değil, **kaynak israfı**.

Tek tek 48 imza değiştirmek büyük ve mekanik bir değişiklik; ödeme akışı
oturduktan sonra ayrı bir turda yapılması daha güvenli.

### 3.2 `GetMoviesQuery` alan adı diğerlerinden farklı

Tüm sayfalı sorgular `PageNumber` kullanırken bu bir tek `Page` kullanıyor.
Ön yüz buna göre `page=1` gönderdiği için **çalışıyor**, ama yeni bir servis
yazan kişi `pageNumber` gönderip sessizce ilk sayfayı alır.

Düzeltmek ön yüzde de eşzamanlı değişiklik gerektiriyor; tek başına
yapılırsa kırar.

### 3.3 `AdminDashboard` paketi 356 kB

`recharts` bu parçanın neredeyse tamamı. Zaten ayrı bir parçaya bölünmüş
(yalnızca panele girildiğinde iniyor), yani ilk açılışı etkilemiyor.
Küçültmek için grafiği daha hafif bir kütüphaneyle ya da elle çizilmiş SVG
ile değiştirmek gerekir — işlevsel bir kazanç sağlamaz.

### 3.4 Rezervasyon oluşturma dağıtık işlem

Sepette N seans varsa N ayrı `POST /api/reservations` gidiyor. Araya giren
bir hata olursa istemci, o ana kadar oluşanları iptal ediyor (telafi işlemi).
Bu bir **saga** ve tarayıcı kapanırsa telafi çalışmaz.

Doğru çözüm çok seanslı tek bir rezervasyon ucu; bu, DTO'ları ve veri
modelini etkileyen büyük bir değişiklik.

---

## 4. Bu turda üretilen kalıp

Son üç oturumda çıkan hataların hepsi **aynı üç kalıptan** geldi. Yeni bir
hata aranırken önce bunlara bakmak zaman kazandırır:

1. **Ön yüz ile backend'in aynı kuralı iki yerde tutması.** Sayfa boyutu
   sınırı, bilet tipi çarpanları, kampanya eşiği — üçü de ayrışmıştı.
   *Önlem:* kuralın bağlayıcı olduğu tarafı yorumda yazmak ve test ile
   sabitlemek.

2. **Backend'in "sepet" kavramını hiç bilmemesi.** Ön yüz sepete göre karar
   veriyor, backend rezervasyona göre doğruluyordu.
   *Önlem:* istemci tarafındaki her uygunluk kontrolünü, backend'in
   doğruladığı **aynı birim** üzerinde yapmak.

3. **Beklenen durumların istisna olarak modellenmesi.** Zaten silinmiş kilidi
   bırakmak, aynı kullanıcının kendi kilidini yenilemesi — ikisi de normal
   akıştı ama istisna fırlatıyordu. Hata ayıklayıcı duraklayınca süreç
   donuyor ve belirti her seferinde "sonsuz yükleniyor" oluyordu.
   *Önlem:* "bu gerçekten bir hata mı yoksa beklenen bir sonuç mu" sorusunu
   istisna yazmadan önce sormak.

---

## 5. Doğrulama

```
dotnet build --no-incremental → 0 uyarı, 0 hata
dotnet test                   → 126 / 126
npm run lint                  → 0 hata
npm run test:run              → 407 / 407 (47 dosya)
```
