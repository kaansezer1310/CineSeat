# CineSeat Backend — CQRS + Onion + MediatR Kurulum Raporu

> **Tarih:** 13 Ağustos 2026 · **Branch:** `omer-cqrs-port` (`origin/main` üzerine kuruldu)
> **Hedef:** sunum · Referans: [BACKEND_IS_PLANI.md](BACKEND_IS_PLANI.md)

---

## 1. Bu raporun konusu

Ekibin `main` branch'indeki **5 projeli yapıya dokunulmadan**, üzerine CQRS altyapısı
(pipeline behavior'ları, `Result<T>`, hata yönetimi, audit interceptor, soft delete)
ve **Movies dikey dilimi** eklendi.

Alptuğ'un Repository pattern'i, Berke'nin proje ayrımı, `AddApplicationServices()` /
`AddPersistenceServices()` isimlendirmesi, `Features/<X>/DTOs/` klasör düzeni —
hepsi **olduğu gibi korundu**. Movies feature'ı Cities'in yazıldığı desene birebir uyar.

| | Öncesi (`origin/main`) | Sonrası |
|---|---|---|
| Feature sayısı | 1 (Cities) | 2 (Cities + Movies) |
| Pipeline behavior | yok | 2 (Logging + Validation) |
| Doğrulama altyapısı | yok | FluentValidation + otomatik tarama |
| Merkezî hata yönetimi | yok | `ExceptionHandlingMiddleware` |
| `CreatedAt` / `UpdatedAt` | hiç dolmuyordu | interceptor otomatik dolduruyor |
| Soft delete (`IsDeleted`) | uygulanmıyordu | global query filter, 21 entity |
| Swagger arayüzü | yok (sadece ham JSON) | `/swagger` |
| Mimari kural testi | — | **20 / 20 geçti** |

---

## 2. Yapıya dokunulmadı — neye uyduk

| Ekibin kararı | Bizim yaptığımız |
|---|---|
| 5 proje: `Core/`, `Infrastructure/`, `Presentation/` | Aynen korundu, proje eklenmedi/silinmedi |
| Repository pattern (`IReadRepository<T>`, `IWriteRepository<T>`) | `IApplicationDbContext` **dayatılmadı**; Movies de repository kullanıyor |
| `BaseEntity` → `Domain/Entities/Common/` | Taşınmadı |
| DTO'lar → `Features/<X>/DTOs/` | `Features/Movies/DTOs/MovieDto.cs` |
| Repo arayüzleri → `Repositories/<X>/`, namespace `CineSeat.Application.Repositories` | `Repositories/Movie/` aynı namespace ile |
| Command = `class`, `IRequest<T>` | Aynı (record'a çevrilmedi) |
| Controller: ctor'da `IMediator`, `[Route("api/[controller]")]` | Aynı |
| `AddApplicationServices()` / `AddPersistenceServices()` | İsimler korundu, içleri genişletildi |

**Sadece 7 mevcut dosya düzenlendi**, hiçbiri yeniden yazılmadı:

| Dosya | Değişiklik |
|---|---|
| `Core/CineSeat.Application/CineSeat.Application.csproj` | MediatR 14.2.0 → **12.4.1**, FluentValidation + Logging.Abstractions eklendi |
| `Core/CineSeat.Application/DependencyInjection.cs` | Validator taraması + 2 pipeline behavior kaydı |
| `Infrastructure/CineSeat.Persistence/ServiceRegistration.cs` | Interceptor + Movie repository kayıtları |
| `Infrastructure/CineSeat.Persistence/Data/ApplicationDbContext.cs` | `ApplySoftDeleteFilter` metodu eklendi (mevcut config'e dokunulmadı) |
| `Presentation/CineSeat.WebAPI/Program.cs` | `UseExceptionHandling()` + Swagger UI |
| `Presentation/CineSeat.WebAPI/CineSeat.WebAPI.csproj` | Swashbuckle SwaggerUI |
| `Presentation/CineSeat.WebAPI/Properties/launchSettings.json` | F5'te tarayıcı `/swagger`'a gitsin |

---

## 3. Eklenen dosyalar

```
backend/
├─ Core/CineSeat.Application/
│  ├─ Common/                             ← YENİ: ortak altyapı
│  │  ├─ Behaviors/
│  │  │  ├─ LoggingBehavior.cs            ← pipeline halkası 1
│  │  │  └─ ValidationBehavior.cs         ← pipeline halkası 2
│  │  ├─ Models/
│  │  │  ├─ Result.cs
│  │  │  └─ PagedResult.cs
│  │  └─ Exceptions/
│  │     ├─ ValidationException.cs
│  │     └─ NotFoundException.cs
│  ├─ Repositories/Movie/                 ← Cities deseniyle aynı
│  │  ├─ IMovieReadRepository.cs
│  │  └─ IMovieWriteRepository.cs
│  └─ Features/Movies/                    ← YENİ dikey dilim
│     ├─ DTOs/MovieDto.cs
│     ├─ Commands/CreateMovie/
│     │  ├─ CreateMovieCommand.cs
│     │  ├─ CreateMovieCommandHandler.cs
│     │  └─ CreateMovieCommandValidator.cs
│     └─ Queries/GetMovies/
│        ├─ GetMoviesQuery.cs
│        └─ GetMoviesQueryHandler.cs
│
├─ Infrastructure/CineSeat.Persistence/
│  ├─ Data/Interceptors/
│  │  └─ AuditableEntityInterceptor.cs
│  └─ Repositories/Movie/
│     ├─ MovieReadRepository.cs
│     └─ MovieWriteRepository.cs
│
└─ Presentation/CineSeat.WebAPI/
   ├─ Controllers/MoviesController.cs
   └─ Middleware/ExceptionHandlingMiddleware.cs
```

---

## 4. Sunumun kalbi: bir istek geldiğinde ne oluyor?

> Hoca **"MediatR yapın nerede, ne iş yapıyor?"** diye sorduğunda anlatılacak akış budur.

**`POST /api/movies`** isteği geldiğinde sırasıyla:

```
  HTTP isteği
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. ExceptionHandlingMiddleware        [CineSeat.WebAPI]      │
│    Tüm boru hattını try/catch içine alır.                    │
│    Uygulamadaki TEK try/catch burasıdır.                     │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. MoviesController.Create()          [CineSeat.WebAPI]      │
│    JSON gövdesi CreateMovieCommand nesnesine bağlanır.       │
│    Controller'ın tek işi: _mediator.Send(command)            │
│    → Burada ne DbContext var, ne repository, ne iş kuralı.   │
└──────────────────────────────────────────────────────────────┘
     │  ← MediatR devreye giriyor
     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. LoggingBehavior                    [CineSeat.Application] │
│    "[CQRS] CreateMovieCommand başladı" loglar, kronometre    │
│    başlatır, sonraki halkaya devreder: await next()          │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. ValidationBehavior                 [CineSeat.Application] │
│    Bu komut için kayıtlı TÜM validator'ları çalıştırır.      │
│    Hata varsa → ValidationException fırlatır ve              │
│    HANDLER HİÇ ÇAĞRILMAZ.                                    │
│    ↑ CreateMovieCommandValidator burada devreye girer.       │
└──────────────────────────────────────────────────────────────┘
     │  (doğrulama geçtiyse)
     ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. CreateMovieCommandHandler          [CineSeat.Application] │
│    Geriye sadece İŞ KURALI kalır:                            │
│      • aynı isim+tarihte film var mı? → Result.Failure       │
│      • Movie entity'si oluştur                               │
│      • _movieWriteRepository.AddAsync(movie)                 │
│      • _movieWriteRepository.SaveAsync()                     │
│    Repository ARAYÜZÜ üzerinden gider —                      │
│    ApplicationDbContext'i HİÇ görmez.                        │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. AuditableEntityInterceptor         [CineSeat.Persistence] │
│    SaveChanges'in hemen öncesinde CreatedAt / UpdatedAt       │
│    alanlarını otomatik doldurur.                             │
└──────────────────────────────────────────────────────────────┘
     │
     ▼
   PostgreSQL          →  Result<long>  →  201 Created { "id": 3 }
```

**Anlatım cümlesi:**
> "Controller sadece HTTP'yi Command'e çeviriyor. MediatR o Command'i alıp önce log
> halkasından, sonra doğrulama halkasından geçiriyor, en sonunda ilgili Handler'a teslim
> ediyor. Handler'ın içinde tek satır doğrulama veya hata yakalama kodu yok — hepsi pipeline'da."

---

## 5. Canlı test sonuçları

Uygulama `http://localhost:5311` üzerinde çalıştırıldı, gerçek PostgreSQL veritabanına
(`CineSeatDb`) bağlandı. Aşağıdakiler **gerçek çıktılardır**.

### 5.1 Geçersiz istek → ValidationBehavior devreye giriyor

```
POST /api/movies
{"title":"","duration":0,"description":"","ageLimit":99,"language":"",
 "poster":"","startDate":"2026-10-01","endDate":"2026-09-01"}
```
```json
HTTP 400
{
  "title": "Doğrulama hatası",
  "status": 400,
  "errors": {
    "Title":       ["Film adı boş olamaz."],
    "Duration":    ["Süre 0'dan büyük olmalıdır."],
    "Description": ["Açıklama boş olamaz."],
    "AgeLimit":    ["Yaş sınırı 0 ile 21 arasında olmalıdır."],
    "Language":    ["Dil bilgisi boş olamaz."],
    "Poster":      ["Poster adresi boş olamaz."],
    "EndDate":     ["Vizyon bitiş tarihi, başlangıç tarihinden sonra olmalıdır."]
  }
}
```
> **Vurgu:** Handler hiç çalışmadı. Bu cevabı üreten kodun tamamı `ValidationBehavior` +
> `ExceptionHandlingMiddleware`. Controller ve Handler'da tek satır doğrulama kodu yok.

### 5.2 Geçerli istek → 201 Created

```
POST /api/movies
{"title":"Kesisme","duration":112,"description":"Bir kavsakta kesisen uc hayat.",
 "ageLimit":13,"language":"TR","poster":"https://img.example/kesisme.jpg",
 "startDate":"2026-11-05","endDate":"2027-01-05"}
```
```json
HTTP 201
{ "id": 3 }
```

### 5.3 Aynı film tekrar → iş kuralı çalışıyor

```json
HTTP 409
{ "error": "'Kesisme' filmi bu vizyon tarihiyle zaten kayıtlı." }
```
> **Vurgu:** Bu bir doğrulama hatası değil, **iş kuralı** ihlali. O yüzden exception
> fırlatılmıyor, handler `Result.Failure(...)` döndürüyor ve controller bunu 409'a çeviriyor.
> Beklenen hata ile beklenmeyen hata ayrımı budur.

### 5.4 Listeleme ve arama (Query tarafı)

```
GET /api/movies?page=1&pageSize=5
  → { "items": [...], "totalCount": 3, "page": 1, "pageSize": 5, "totalPages": 1 }

GET /api/movies?search=kesis
  → 1 sonuç ("Kesisme")  ← küçük harfle arandı, büyük harfli kayıt bulundu
```

### 5.5 Audit alanları otomatik dolmuş — **Cities dahil**

```sql
SELECT id, city_name, created_at FROM cities;
```
```
 id | city_name |          created_at
----+-----------+-------------------------------
  1 | Eskisehir | 2026-08-13 17:20:12.852517+03
```
> **Önemli:** `CreateCityCommandHandler` (Alptuğ'un kodu) hiç değiştirilmedi, ama artık
> `CreatedAt` alanı otomatik doluyor. Interceptor `BaseEntity`'den türeyen **her entity** için
> çalışıyor — feature başına kod yazmaya gerek yok.

### 5.6 Soft delete filtresi çalışıyor

`movies` tablosunda `id=3` için `is_deleted = true` yapıldığında:

```
GET /api/movies      →  dönen id'ler: [1, 2]  ·  totalCount: 2
GET /api/movies/3    →  HTTP 404
```
> Sorgu handler'ında tek satır `IsDeleted` filtresi yok. `ApplicationDbContext` içindeki
> **global query filter** `BaseEntity`'den türeyen 21 entity'nin hepsine otomatik uyguluyor.

### 5.7 Pipeline logları — Cities de bedavaya kazandı

```
info: [CQRS] CreateMovieCommand başladı
info: [CQRS] CreateMovieCommand bitti (42 ms)
info: [CQRS] CreateCityCommand başladı      ← Alptuğ'un feature'ı
info: [CQRS] CreateCityCommand bitti (16 ms)
info: [CQRS] GetAllCitiesQuery başladı      ← Alptuğ'un feature'ı
info: [CQRS] GetAllCitiesQuery bitti (5 ms)
```
> **Sunumda bunu mutlaka söyle:** Cities feature'ının kodunda **tek karakter değişmedi**,
> ama pipeline'a eklendiği için otomatik loglanmaya başladı. Cross-cutting concern'ün
> pipeline'a taşınmasının en somut kanıtı bu.

### 5.8 Regresyon kontrolü

```
POST /api/cities  {"cityName":"Eskisehir"}   →  HTTP 200
GET  /api/cities                             →  HTTP 200  [{"id":1,"cityName":"Eskisehir"}]
```
> Alptuğ'un Cities feature'ı bozulmadan çalışmaya devam ediyor.

### 5.9 Derleme ve migration durumu

```
dotnet build --no-incremental   →  0 Hata, 80 Uyarı
dotnet ef migrations has-pending-model-changes
  →  "No changes have been made to the model since the last migration."
```
> Soft delete query filter şemayı **değiştirmez**, yeni migration gerekmiyor.
> Mevcut 3 migration olduğu gibi korundu.

---

## 6. Mimari test sonuçları — 20 / 20

NetArchTest ile 20 kural, derlenmiş 4 assembly üzerinde koşuldu.
*(Test projesi karar gereği repoya eklenmedi, ayrı bir çalışma alanında koşturuldu.)*

| Assembly | Tip sayısı |
|---|---|
| `CineSeat.Domain` | 27 |
| `CineSeat.Application` | 26 |
| `CineSeat.Persistence` | 13 |
| `CineSeat.WebAPI` | 5 |

```
D-01  GEÇTİ  27  Domain → Application/Persistence/WebAPI bağımlılığı olmamalı
D-02  GEÇTİ  27  Domain → EF Core / Npgsql bağımlılığı olmamalı
D-03  GEÇTİ  27  Domain SADECE System.* ve kendine bağlı olmalı (saf çekirdek)
D-04  GEÇTİ   5  Domain.Enums → Domain.Entities bağımlılığı olmamalı
A-01  GEÇTİ  26  Application → Persistence/WebAPI bağımlılığı olmamalı
A-02  GEÇTİ  26  Application → Npgsql (DB sağlayıcısı) bağımlılığı olmamalı
A-03  GEÇTİ  26  Application → ASP.NET Core bağımlılığı olmamalı
P-01  GEÇTİ  13  Persistence → WebAPI bağımlılığı olmamalı
C-01  GEÇTİ   2  Controller'lar Persistence'a doğrudan bağımlı olmamalı
C-02  GEÇTİ   2  Controller'lar Domain.Entities'e doğrudan bağımlı olmamalı (DTO dönmeli)
N-01  GEÇTİ  21  Domain.Entities altındaki class'lar BaseEntity'den türemeli
N-02  GEÇTİ  21  BaseEntity türevleri Domain.Entities'te olmalı
N-03  GEÇTİ   1  DbContext türevleri sadece Persistence'da olmalı
N-04  GEÇTİ   2  WebAPI.Controllers altındaki tipler 'Controller' ile bitmeli
Q-01  GEÇTİ   4  IRequestHandler implementasyonları 'Handler' ile bitmeli
Q-02  GEÇTİ   4  Handler'lar Application.Features altında olmalı
Q-03  GEÇTİ   4  Command/Query tipleri Application.Features altında olmalı
Q-04  GEÇTİ   4  Repository ARAYÜZLERİ Application'da olmalı
Q-05  GEÇTİ   4  Repository IMPLEMENTASYONLARI Persistence'da olmalı
Q-06  GEÇTİ   2  Pipeline behavior'ları Application.Common.Behaviors altında olmalı
```

### Ölçülen gerçek assembly bağımlılıkları

```
CineSeat.Domain       →  (hiçbir şey)
CineSeat.Application  →  CineSeat.Domain, MediatR, FluentValidation, EntityFrameworkCore
CineSeat.Persistence  →  CineSeat.Application, CineSeat.Domain, EntityFrameworkCore(+Npgsql)
CineSeat.WebAPI       →  CineSeat.Application, CineSeat.Persistence, MediatR, AspNetCore
```

> Oklar **tamamen içeri doğru**. `CineSeat.Domain` hiçbir şeye bağlı değil.
> `WebAPI → Persistence` bağı sadece `Program.cs`'in `AddPersistenceServices()` çağrısı
> için var (composition root); **controller'lar Persistence'ı hiç görmüyor** — C-01 bunu
> ölçüyor ve geçiyor.

---

## 7. 5 projeli yapının tek projeye göre farkı (hoca sorabilir)

Bu, sunumda anlatılmaya değer somut bir olay:

Movies query handler'ı ilk yazıldığında `EF.Functions.ILike(...)` kullanıyordu —
PostgreSQL'e özgü, büyük/küçük harf duyarsız arama fonksiyonu. **Derleme hata verdi:**

```
error CS1061: 'DbFunctions' bir 'ILike' tanımı içermiyor
```

Çünkü `ILike` metodu `Npgsql.EntityFrameworkCore.PostgreSQL` paketinde yaşar ve
`CineSeat.Application` projesi o pakete referans vermiyor — **vermemeli de**.

> **Sunum cümlesi:** "Bu hata mimarinin çalıştığının kanıtı. Application katmanı hangi
> veritabanını kullandığımızı bilmiyor; PostgreSQL'e özel bir fonksiyon yazmaya
> çalıştığımızda derleyici bizi durdurdu. Tek projeli yapıda bu kod sorunsuz derlenirdi
> ve katman ihlali fark edilmezdi."

Çözüm: sağlayıcıdan bağımsız `m.Title.ToLower().Contains(search)` kullanıldı —
PostgreSQL'de yine `lower(title) LIKE '%...%'` sorgusuna çevriliyor, davranış aynı.

**Genel kural:** 5 projeli yapıda D-01…D-03, A-01 gibi kuralları **derleyicinin kendisi**
zorluyor (`CineSeat.Domain.csproj` hiçbir projeye referans vermiyor — veremez).
NetArchTest'in değeri burada kayıyor: artık derleyicinin göremediği şeyleri ölçüyor —
isimlendirme kuralları, "controller Persistence tipi kullanmasın", "handler'lar Features
altında olsun" gibi.

---

## 8. Bilinçli kararlar

### 8.1 MediatR 14.2.0 → 12.4.1
MediatR'ın **13.0 sürümünden itibaren lisansı ticariye geçti**. `12.4.1` son
Apache-2.0 (ücretsiz) sürüm. API'si aynı olduğu için **Cities feature'ının kodunda
hiçbir değişiklik gerekmedi**. Hoca lisans sorarsa cevap hazır.

### 8.2 `IApplicationDbContext` yerine mevcut Repository pattern
Ekip zaten `IReadRepository<T>` / `IWriteRepository<T>` kurmuş. İkinci bir soyutlama
eklemek iki farklı veri erişim stili doğururdu. Movies de repository kullanıyor.

### 8.3 Application EF Core'u tanıyor, Npgsql'i tanımıyor
`IRepository<T>.Table` bir `DbSet<T>` döndürdüğü için Application EF Core'a bağımlı —
bu ekibin mevcut tasarım kararı ve sektörde standart. Kritik sınır şu: Application
**veritabanı sağlayıcısını (Npgsql) tanımaz** (A-02 kuralı bunu ölçüyor).
PostgreSQL'den SQL Server'a geçilse Application'da tek satır değişmez.

### 8.4 Beklenen hata → `Result`, beklenmeyen hata → exception
"Bu film zaten kayıtlı" beklenen bir durumdur → `Result.Failure` (409).
"Doğrulama hatası", "kayıt bulunamadı" akışı kesen durumlardır → exception →
middleware. İkisi karıştırılmadı.

### 8.5 Tarih alanlarında UTC dönüşümü
PostgreSQL'de `start_date`/`end_date` kolonları `timestamp with time zone` tipinde.
Npgsql bu kolonlara `Kind`'ı `Utc` olmayan `DateTime` yazılmasına izin vermiyor.
JSON'dan gelen tarihler `Unspecified` geldiği için `CreateMovieCommandHandler` içinde
UTC'ye sabitleniyor. *(Uzun vadeli doğru çözüm: bu alanları `DateOnly` yapmak.)*

---

## 9. Mevcut kodda tespit edilenler (değiştirilmedi)

"Yapıya dokunma" talimatı gereği bunlara **el sürülmedi**, ama bilinmesi gerekiyor:

| # | Bulgu | Etki |
|---|---|---|
| 1 | `IReadRepository.GetByIdAsync(string id)` ve `IWriteRepository.RemoveAsync(string id)` — entity `Id`'si `long`, metot içinde `long.Parse(id)` yapılıyor | Geçersiz id gelirse `FormatException` → 500. İmza `long id` olmalı |
| 2 | `GetSingleAsync` / `GetByIdAsync` dönüş tipi `Task<T>` ama `FirstOrDefaultAsync` null dönebiliyor | 4 adet CS8603/CS8600/CS8604 uyarısı. Dönüş `Task<T?>` olmalı |
| 3 | `CineSeat.Infrastructure` projesi sadece `Class1.cs` içeriyor, WebAPI referans veriyor ama hiçbir servis kaydetmiyor | Ölü proje. Ya doldurulmalı ya kaldırılmalı |
| 4 | `CreateCityCommandHandler` ham `long` dönüyor, Movies `Result<long>` dönüyor | İki farklı dönüş stili. Cities de `Result<T>`'ye geçirilmeli |
| 5 | Cities feature'ının validator'ı yok | `ValidationBehavior` bunu sorunsuz atlıyor (`if (!_validators.Any())`), ama `cityName` boş gönderilebiliyor |
| 6 | `Application/Common/.gitkeep` ve `Application/Features/.gitkeep` | Artık gereksiz, klasörler doldu |
| 7 | 76 adet `CS8618` — entity'lerdeki non-nullable property'ler initialize edilmiyor | Toplam 80 uyarının 76'sı bu. Ayrı bir temizlik turu gerektiriyor |
| 8 | Entity'ler tamamen anemik (public setter, davranış yok) | `SeatLock`/`Reservation` iş kuralları ileride handler'lara dağılacak |

---

## 10. Bilerek yazılmayanlar

| Eksik | Not |
|---|---|
| Diğer 19 entity'nin Command/Query'leri | Şablon kuruldu; her biri aynı dosyaların kopyası |
| `UpdateMovie`, `DeleteMovie` | Aynı desen, ek bir şey öğretmiyor |
| `GetMovieByIdQuery` | `GetById` endpoint'i şu an `GetMoviesQuery`'yi filtreleyerek çalışıyor — geçici |
| JWT authentication + RBAC | Faz 3; `Permission`/`Role` tabloları hazır |
| Seed data | Faz 3 |
| Unit / integration testler | Faz 3 |
| Mimari testlerin repoya eklenmesi | Karar gereği eklenmedi; istenirse `tests/CineSeat.ArchitectureTests/` olarak 3 komutla eklenir |

---

## 11. Nasıl çalıştırılır

```bash
cd backend/Presentation/CineSeat.WebAPI
dotnet run
```

Visual Studio'da: `CineSeat.WebAPI`'yi **Set as Startup Project** yapıp **F5** —
tarayıcı otomatik `/swagger` adresine gider.

| Adres | Ne |
|---|---|
| `http://localhost:5207/swagger` | Swagger arayüzü (demo buradan) |
| `POST /api/movies` | Film oluştur |
| `GET /api/movies?search=&page=1&pageSize=10` | Film listele |
| `GET /api/movies/{id}` | Tek film |
| `POST /api/cities` · `GET /api/cities` | Alptuğ'un feature'ı |

**Ön koşul:** PostgreSQL çalışıyor olmalı; bağlantı dizesi
`Presentation/CineSeat.WebAPI/appsettings.json → ConnectionStrings:DefaultConnection`.

**EF komutları** (migration'lar Persistence'da, startup WebAPI):
```bash
cd backend
dotnet ef migrations add Ad --project Infrastructure/CineSeat.Persistence --startup-project Presentation/CineSeat.WebAPI
dotnet ef database update    --project Infrastructure/CineSeat.Persistence --startup-project Presentation/CineSeat.WebAPI
```

---

## 12. Demo senaryosu (önerilen sıra)

1. **Solution Explorer'ı göster** — 5 proje, `Core / Infrastructure / Presentation` ayrımı.
   `CineSeat.Domain`'in **hiçbir referansı olmadığını** göster.
2. **`MoviesController.Create`'i aç** — "içinde tek satır iş mantığı yok, sadece `_mediator.Send`".
3. **Swagger'dan boş bir istek gönder** → 400 ve 7 doğrulama hatası.
   → *"Bu cevabı Handler üretmedi, `ValidationBehavior` üretti. Handler hiç çalışmadı."*
4. **Geçerli istek gönder** → 201 Created.
5. **Aynı isteği tekrar gönder** → 409.
   → *"Bu doğrulama değil, iş kuralı. Handler `Result.Failure` döndürdü."*
6. **`GET /api/movies`** → listeyi göster, entity değil DTO döndüğünü vurgula.
7. **`POST /api/cities` gönder, konsol loglarını göster** →
   → *"Cities feature'ının kodunda tek karakter değiştirmedik, ama pipeline'a girdiği için
   otomatik loglanıyor. Cross-cutting concern budur."*
8. **`ApplicationDbContext`'i aç** → soft delete global filter.
   → *"21 entity'nin hepsi için tek yerden. Handler'larda tek satır `IsDeleted` yok."*
9. *(Vakit varsa)* **§7'deki `ILike` hikâyesini anlat** — derleyicinin katman ihlalini yakalaması.

**Kapanış cümlesi:**
> "Yeni bir feature eklemek 3 dosya yazmak demek: Command, Handler, Validator.
> `Program.cs`'e, DI kayıtlarına, controller altyapısına hiç dokunmuyoruz.
> Bu yüzden üç kişi aynı anda farklı modüllerde çalışabiliyoruz."

---

## 13. Branch durumu

| Branch | İçerik |
|---|---|
| `omer` | Eski tek-projeli deneme (`backend/CineSeat/`). Dokunulmadı, olduğu gibi duruyor |
| `omer-cqrs-port` | **Bu rapordaki iş.** `origin/main` üzerine kuruldu |
| `origin/main` | Ekibin 5 projeli yapısı + Cities feature'ı |

Bu branch henüz commit edilmedi; `git status` ile 7 düzenlenmiş + 19 yeni `.cs` dosyası görünür.
`main`'e açılacak PR bu branch'ten çıkmalı.
