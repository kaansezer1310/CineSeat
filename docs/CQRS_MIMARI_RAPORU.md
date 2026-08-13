# CineSeat Backend — CQRS + Onion + MediatR Kurulum Raporu

> **Tarih:** 13 Ağustos 2026 · **Branch:** `omer` · **Hedef:** sunum
>
> Bu doküman, backend'in CQRS + Onion mimarisine göre yeniden kurulmasını,
> canlı test sonuçlarını ve sunumda anlatılacak akışı içerir.
> Referans: [BACKEND_IS_PLANI.md](BACKEND_IS_PLANI.md) (Faz 0 + Faz 1)

---

## 1. Tek cümlelik özet

Daha önce yapılan mimari denetimde `Application` ve `Api` katmanlarının **fiilen boş olduğu**
(sadece `.gitkeep` dosyaları) tespit edilmişti. Bu iş kapsamında bu iki katman kuruldu,
MediatR pipeline'ı devreye alındı ve **tek bir dikey dilim** (Movies) uçtan uca yazıldı.

| | Önce | Sonra |
|---|---|---|
| Derlenen tip sayısı | 33 | 122 |
| `CineSeat.Application` namespace'i | **yok** | 15 tip |
| `CineSeat.Api` namespace'i | **yok** | 5 tip |
| Mimari kural sonucu | 11 geçti / **11 boşta** | **22 geçti / 0 boşta** |
| Çalışan endpoint | 0 | 3 |

---

## 2. Kurulan yapı

```
backend/CineSeat/
│
├─ Program.cs                       ← 25 satır: sadece 3 katmanı çağırır
│
├─ Domain/                          ← HİÇBİR ŞEYE bağımlı değil
│  ├─ Common/
│  │  └─ BaseEntity.cs              ← Entities/Common/ altından buraya taşındı
│  ├─ Entities/                     ← 21 entity
│  └─ Enums/                        ← 5 enum
│
├─ Application/                     ← Domain'e bağlı, Infrastructure'ı TANIMAZ
│  ├─ DependencyInjection.cs        ← AddApplication()
│  ├─ Common/
│  │  ├─ Interfaces/
│  │  │  └─ IApplicationDbContext.cs
│  │  ├─ Models/
│  │  │  ├─ Result.cs
│  │  │  └─ PagedResult.cs
│  │  ├─ Behaviors/
│  │  │  ├─ ValidationBehavior.cs   ← pipeline halkası 2
│  │  │  └─ LoggingBehavior.cs      ← pipeline halkası 1
│  │  └─ Exceptions/
│  │     ├─ ValidationException.cs
│  │     └─ NotFoundException.cs
│  └─ Features/
│     └─ Movies/
│        ├─ Commands/CreateMovie/
│        │  ├─ CreateMovieCommand.cs
│        │  ├─ CreateMovieCommandHandler.cs
│        │  └─ CreateMovieCommandValidator.cs
│        └─ Queries/GetMovies/
│           ├─ GetMoviesQuery.cs
│           ├─ GetMoviesQueryHandler.cs
│           └─ MovieDto.cs
│
├─ Infrastructure/                  ← Application + Domain'e bağlı
│  ├─ DependencyInjection.cs        ← AddInfrastructure()
│  ├─ Data/
│  │  ├─ ApplicationDbContext.cs    ← : DbContext, IApplicationDbContext
│  │  └─ Interceptors/
│  │     └─ AuditableEntityInterceptor.cs
│  └─ Migrations/                   ← mevcut 3 migration korundu
│
└─ Api/                             ← Sadece Application'a bağlı
   ├─ DependencyInjection.cs        ← AddApi()
   ├─ Controllers/
   │  ├─ BaseApiController.cs
   │  └─ MoviesController.cs
   └─ Middleware/
      └─ ExceptionHandlingMiddleware.cs
```

**Kaldırılanlar:** `Application/Common/.gitkeep`, `Application/Features/.gitkeep`,
`Controllers/.gitkeep` (kök klasördeki boş `Controllers/` → `Api/Controllers/`).

---

## 3. Sunumun kalbi: bir istek geldiğinde ne oluyor?

> Hoca "MediatR yapın nerede, ne iş yapıyor?" diye sorduğunda anlatılacak akış budur.

**`POST /api/movies`** isteği geldiğinde sırasıyla:

```
  HTTP isteği
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. ExceptionHandlingMiddleware                              │  Api/Middleware/
│    Tüm boru hattını try/catch içine alır.                   │
│    Uygulamadaki TEK try/catch burasıdır.                    │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. MoviesController.Create()                                │  Api/Controllers/
│    JSON gövdesi CreateMovieCommand nesnesine bağlanır.      │
│    Controller'ın tek işi: Sender.Send(command)              │
│    → Burada ne DbContext var, ne if, ne iş kuralı.          │
└─────────────────────────────────────────────────────────────┘
     │  MediatR devreye giriyor
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. LoggingBehavior            (IPipelineBehavior)           │  Application/Common/Behaviors/
│    "[CQRS] CreateMovieCommand başladı" loglar, kronometre   │
│    başlatır, sonraki halkaya devreder: await next()         │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ValidationBehavior         (IPipelineBehavior)           │  Application/Common/Behaviors/
│    Bu komut için kayıtlı TÜM validator'ları çalıştırır.     │
│    Hata varsa → ValidationException fırlatır ve             │
│    HANDLER HİÇ ÇAĞRILMAZ.                                   │
│    ↑ CreateMovieCommandValidator burada devreye girer.      │
└─────────────────────────────────────────────────────────────┘
     │  (doğrulama geçtiyse)
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. CreateMovieCommandHandler                                │  Application/Features/.../CreateMovie/
│    Geriye sadece İŞ KURALI kalır:                           │
│      • aynı isim+tarihte film var mı? → Result.Failure      │
│      • Movie entity'si oluştur                              │
│      • _context.Movies.Add(movie)                           │
│      • SaveChangesAsync()                                   │
│    IApplicationDbContext üzerinden gider —                  │
│    somut DbContext'i HİÇ görmez.                            │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AuditableEntityInterceptor                               │  Infrastructure/Data/Interceptors/
│    SaveChanges'in hemen öncesinde CreatedAt / UpdatedAt      │
│    alanlarını otomatik doldurur.                            │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
   PostgreSQL          →  Result<long>  →  201 Created { "id": 1 }
```

**Anlatım cümlesi:**
> "Controller sadece HTTP'yi Command'e çeviriyor. MediatR o Command'i alıp önce log
> halkasından, sonra doğrulama halkasından geçiriyor, en sonunda ilgili Handler'a teslim ediyor.
> Handler'ın içinde tek satır doğrulama veya hata yakalama kodu yok — hepsi pipeline'da."

---

## 4. Her dosya ne iş yapıyor?

| Dosya | Görevi | Sunumda vurgu |
|---|---|---|
| `MoviesController.cs` | HTTP ↔ Command/Query çevirisi | "İçinde iş mantığı yok" |
| `BaseApiController.cs` | `ISender`'ı sağlar | Her controller'da ctor tekrarını önler |
| `CreateMovieCommand.cs` | Yazma isteğinin veri paketi (`record`) | CQRS'in **C**'si |
| `CreateMovieCommandValidator.cs` | FluentValidation kuralları | **Elle hiç çağrılmıyor** |
| `CreateMovieCommandHandler.cs` | İş kuralı + veritabanı yazma | Sadece iş kuralı kaldı |
| `GetMoviesQuery.cs` | Okuma isteği (arama + sayfalama) | CQRS'in **Q**'su |
| `GetMoviesQueryHandler.cs` | `AsNoTracking` + DTO projeksiyonu | Okuma yolu ayrı optimize edilebiliyor |
| `MovieDto.cs` | Dışarıya açılan sözleşme | Entity asla dışarı çıkmaz |
| `ValidationBehavior.cs` | Pipeline: doğrulama | Cross-cutting concern örneği |
| `LoggingBehavior.cs` | Pipeline: log + süre ölçümü | İkinci cross-cutting örneği |
| `IApplicationDbContext.cs` | Application'ın DB penceresi | **Dependency Inversion'ın tam yeri** |
| `ApplicationDbContext.cs` | Arayüzün somut karşılığı + soft delete filtresi | Infrastructure detayı |
| `AuditableEntityInterceptor.cs` | `CreatedAt`/`UpdatedAt` otomatik | Kimse elle set etmiyor |
| `ExceptionHandlingMiddleware.cs` | Exception → HTTP kodu | Uygulamadaki tek try/catch |
| `*/DependencyInjection.cs` | Katman başına DI kaydı | `Program.cs` 25 satırda kaldı |

### `Program.cs` — tamamı

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApi();

var app = builder.Build();

app.UseExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => { options.SwaggerEndpoint("/openapi/v1.json", "CineSeat API v1"); });
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

> **Neden önemli:** Yeni bir Command/Query/Handler eklerken **bu dosyaya dokunulmaz**.
> MediatR ve FluentValidation assembly taraması yaptığı için yeni sınıflar otomatik bulunur.
> 3 kişi paralel çalışırken en büyük merge conflict kaynağı böylece ortadan kalkar.

---

## 5. Canlı test sonuçları

Uygulama `http://localhost:5299` üzerinde çalıştırıldı, gerçek PostgreSQL veritabanına
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
{"title":"Dune: Part Three","duration":166,"description":"Arrakis geri dönüyor.",
 "ageLimit":13,"language":"EN","poster":"https://img.example/dune3.jpg",
 "startDate":"2026-09-15","endDate":"2026-12-15"}
```
```json
HTTP 201
{ "id": 1 }
```

### 5.3 Aynı film tekrar → iş kuralı çalışıyor

```json
HTTP 409
{ "error": "'Dune: Part Three' filmi bu vizyon tarihiyle zaten kayıtlı." }
```
> **Vurgu:** Bu bir doğrulama hatası değil, **iş kuralı** ihlali. O yüzden exception
> fırlatılmıyor, handler `Result.Failure(...)` döndürüyor ve controller bunu 409'a çeviriyor.
> Beklenen hata ile beklenmeyen hata ayrımı budur.

### 5.4 Listeleme (Query tarafı)

```
GET /api/movies?page=1&pageSize=10
```
```json
HTTP 200
{
  "items": [
    { "id": 1, "title": "Dune: Part Three", "duration": 166, "avgScore": 0.00, ... },
    { "id": 2, "title": "Yesilcam Gecesi",  "duration": 95,  "avgScore": 0.00, ... }
  ],
  "totalCount": 2, "page": 1, "pageSize": 10, "totalPages": 1
}
```

### 5.5 Arama — büyük/küçük harf duyarsız

```
GET /api/movies?search=dune      →  1 sonuç ("Dune: Part Three")
```
PostgreSQL'in `ILIKE` operatörü kullanılıyor (`EF.Functions.ILike`).

### 5.6 Audit alanları otomatik dolmuş

```sql
SELECT id, title, created_at, updated_at FROM movies;
```
```
 id |      title       |          created_at           | updated_at
----+------------------+-------------------------------+------------
  1 | Dune: Part Three | 2026-08-13 14:53:49.721055+03 |
  2 | Yesilcam Gecesi  | 2026-08-13 14:54:01.380237+03 |
```
> Handler'da `CreatedAt` **hiç set edilmiyor** — `AuditableEntityInterceptor` dolduruyor.

### 5.7 Soft delete filtresi çalışıyor

`movies` tablosunda `id=1` için `is_deleted = true` yapıldığında:

```
GET /api/movies      →  totalCount: 1  (sadece id=2 dönüyor)
GET /api/movies/1    →  HTTP 404
```
> Sorgu handler'ında tek satır `IsDeleted` filtresi yok. `ApplicationDbContext` içindeki
> **global query filter** `BaseEntity`'den türeyen 21 entity'nin hepsine otomatik uyguluyor.

### 5.8 Pipeline logları

```
info: [CQRS] CreateMovieCommand başladı
info: [CQRS] CreateMovieCommand bitti (42 ms)
info: [CQRS] GetMoviesQuery başladı
info: [CQRS] GetMoviesQuery bitti (3 ms)
```
> `LoggingBehavior` her istek için otomatik. Bunun için hiçbir handler'a kod yazılmadı.

---

## 6. Mimari test sonuçları

NetArchTest ile 22 kural, derlenmiş `CineSeat.dll` üzerinde tekrar koşuldu.

| | Önceki denetim | Şimdi |
|---|---|---|
| Geçti | 11 | **22** |
| Boşta (kapsamda hiç tip yok) | 11 | **0** |
| İhlal | 0 | **0** |

```
D-01  GEÇTİ  27 tip   Domain → Application bağımlılığı olmamalı
D-02  GEÇTİ  27 tip   Domain → Infrastructure bağımlılığı olmamalı
D-03  GEÇTİ  27 tip   Domain → EF Core / Npgsql bağımlılığı olmamalı
D-04  GEÇTİ  27 tip   Domain → ASP.NET Core bağımlılığı olmamalı
D-05  GEÇTİ  27 tip   Domain SADECE System.* ve kendine bağlı olmalı
D-06  GEÇTİ   5 tip   Domain.Enums → Domain.Entities bağımlılığı olmamalı
A-01  GEÇTİ  15 tip   Application → Infrastructure bağımlılığı olmamalı
A-02  GEÇTİ  15 tip   Application → Npgsql bağımlılığı olmamalı
A-03  GEÇTİ  15 tip   Application → ASP.NET Core / Controller bağımlılığı olmamalı
I-01  GEÇTİ   7 tip   Infrastructure → Api bağımlılığı olmamalı
C-01  GEÇTİ   5 tip   Controller → Infrastructure doğrudan bağımlılığı olmamalı
C-02  GEÇTİ   5 tip   Controller → Domain.Entities doğrudan bağımlılığı olmamalı
N-01  GEÇTİ  21 tip   Entity'ler BaseEntity'den türemeli
N-02  GEÇTİ  21 tip   BaseEntity türevleri Domain.Entities'te olmalı
N-03  GEÇTİ   1 tip   DbContext türevleri sadece Infrastructure'da olmalı
N-04  GEÇTİ  21 tip   Entity'ler public olmalı
N-05  GEÇTİ   2 tip   Api.Controllers altındaki tipler 'Controller' ile bitmeli
Q-01  GEÇTİ   2 tip   Handler'lar 'Handler' ile bitmeli
Q-02  GEÇTİ   2 tip   Command/Query'ler Application.Features altında olmalı
Q-03  GEÇTİ   2 tip   Handler'lar Application katmanında olmalı
Q-04  GEÇTİ  47 tip   Npgsql yalnızca Infrastructure'da kullanılabilir
Q-05  GEÇTİ   1 tip   IApplicationDbContext, Application.Common'da olmalı
```

### Ölçülen gerçek katman bağımlılıkları

| Katman | Tip | Neye bağlı |
|---|---|---|
| `CineSeat.Domain` | 27 | **hiçbir şey** |
| `CineSeat.Application` | 15 | Domain, EntityFrameworkCore |
| `CineSeat.Infrastructure` | 7 | Domain, Application, EntityFrameworkCore, Npgsql |
| `CineSeat.Api` | 5 | Application, AspNetCore |

> Bağımlılık okları **tamamen içeri doğru**. `Api` katmanı Infrastructure'ı hiç tanımıyor;
> `Application` veritabanı sağlayıcısını (Npgsql) hiç tanımıyor.

**Not:** Bu testler karar gereği repoya eklenmedi; scratchpad'de çalıştırıldı.
İstenirse `tests/CineSeat.ArchitectureTests/` olarak eklenebilir (3 komut, ~15 dk).

---

## 7. Bilinçli kararlar ve gerekçeleri

Hoca "neden böyle yaptınız?" diye sorarsa:

### 7.1 MediatR 12.4.1 (13.x değil)
MediatR'ın **13.0 sürümünden itibaren lisansı ticariye geçti**. `12.4.1` son
Apache-2.0 (ücretsiz) sürüm ve tüm ihtiyacımızı karşılıyor. Bilinçli olarak sabitlendi.

### 7.2 Application katmanı EF Core'u tanıyor, Npgsql'i tanımıyor
`IApplicationDbContext`, `DbSet<T>` tipini kullandığı için Application EF Core'a bağımlı.
Bu, sektördeki Clean Architecture şablonlarının standart tercihi — EF Core burada
bir *veri erişim soyutlaması* olarak kabul edilir.

Kritik olan sınır şudur: Application **veritabanı sağlayıcısını (Npgsql) tanımaz**.
Yani PostgreSQL'den SQL Server'a geçilse Application katmanında **tek satır değişmez**.
İlk mimari denetimde A-02 kuralı "EF Core da yasak" şeklindeydi; bu kural bilinçli olarak
"Npgsql yasak" şeklinde daraltıldı ve gerekçesi buraya yazıldı.

### 7.3 Repository pattern kullanılmadı
EF Core'un `DbSet<T>`'i zaten Repository, `DbContext` zaten Unit of Work.
Üzerine bir katman daha koymak bu projede sadece dosya sayısını artırırdı.

### 7.4 Beklenen hata → `Result`, beklenmeyen hata → exception
"Bu film zaten kayıtlı" beklenen bir durumdur → `Result.Failure` ile döner (409).
"Kayıt bulunamadı", "doğrulama hatası" gibi akışı kesen durumlar exception ile
middleware'e taşınır. İkisi karıştırılmadı.

### 7.5 `record` kullanımı
Command/Query/DTO'lar `record` olarak tanımlandı — bunlar değişmez (immutable)
veri paketleridir, `class` olmalarına gerek yok.

### 7.6 Tarih alanlarında UTC dönüşümü
PostgreSQL'de `start_date`/`end_date` kolonları `timestamp with time zone` tipinde.
Npgsql bu kolonlara `Kind`'ı `Utc` olmayan `DateTime` yazılmasına izin vermiyor.
JSON'dan gelen tarihler `Unspecified` geldiği için `CreateMovieCommandHandler` içinde
UTC'ye sabitleniyor. *(Uzun vadeli doğru çözüm: bu alanları `DateOnly` yapmak —
bkz. Bölüm 8.)*

---

## 8. Bilerek yazılmayanlar

Sunum kapsamında **kasıtlı olarak** dışarıda bırakıldı. Hoca sorarsa "iskelet kuruldu,
kalan feature'lar aynı şablonun kopyası" denebilir:

| Eksik | Neden / Not |
|---|---|
| Diğer 20 entity'nin Command/Query'leri | Şablon kuruldu; her biri aynı 3 dosyanın kopyası |
| `UpdateMovie`, `DeleteMovie` | Aynı desen, ek bir şey öğretmiyor |
| `GetMovieByIdQuery` | `GetById` endpoint'i şu an `GetMoviesQuery`'yi filtreleyerek çalışıyor — geçici |
| JWT authentication + RBAC | Faz 3 işi; `Permission`/`Role` tabloları hazır |
| Seed data | Faz 3 |
| Unit / integration testler | Faz 3 |
| **76 adet `CS8618` uyarısı** | Entity'lerdeki non-nullable property'ler hâlâ initialize edilmiyor. Mimari işi değil, ayrı bir temizlik turu gerektiriyor |
| Entity'lerin anemik olması | `SeatLock`/`Reservation` iş kuralları ileride entity'ye taşınmalı |
| `IEntityTypeConfiguration` ayrımı | `OnModelCreating` hâlâ tek blok; 3 kişi entity eklerken conflict riski |

---

## 9. Nasıl çalıştırılır

```bash
cd backend/CineSeat
dotnet run
```

Visual Studio'da: **F5** → tarayıcı otomatik `/swagger` adresine gider.

| Adres | Ne |
|---|---|
| `http://localhost:5207/swagger` | Swagger arayüzü (demo buradan yapılabilir) |
| `http://localhost:5207/openapi/v1.json` | Ham OpenAPI belgesi |
| `POST /api/movies` | Film oluştur |
| `GET /api/movies?search=&page=1&pageSize=10` | Film listele |
| `GET /api/movies/{id}` | Tek film |

**Ön koşul:** PostgreSQL çalışıyor olmalı; bağlantı dizesi
`appsettings.json → ConnectionStrings:DefaultConnection`.

**Migration durumu:** Şema değişmedi. `dotnet ef migrations has-pending-model-changes`
→ *"No changes have been made to the model since the last migration."*
Mevcut 3 migration olduğu gibi korundu, yeni migration gerekmiyor.

---

## 10. Eklenen paketler

| Paket | Sürüm | Ne için |
|---|---|---|
| `MediatR` | 12.4.1 | CQRS dispatcher + pipeline |
| `FluentValidation.DependencyInjectionExtensions` | 11.11.0 | Validator'lar + assembly tarama |
| `Swashbuckle.AspNetCore.SwaggerUI` | 10.2.3 | Swagger arayüzü (belge .NET 10'un kendi OpenAPI'sinden geliyor) |

---

## 11. Demo senaryosu (önerilen sıra)

1. **Klasör yapısını göster** — 4 katman, `Program.cs`'in 25 satır olduğunu göster.
2. **`MoviesController.Create`'i aç** — "içinde tek satır iş mantığı yok, sadece `Sender.Send`".
3. **Swagger'dan boş bir istek gönder** → 400 ve 7 doğrulama hatası gelsin.
   → "Bu cevabı Handler üretmedi, `ValidationBehavior` üretti. Handler hiç çalışmadı."
4. **Geçerli istek gönder** → 201 Created.
5. **Aynı isteği tekrar gönder** → 409.
   → "Bu doğrulama değil, iş kuralı. Handler `Result.Failure` döndürdü."
6. **`GET /api/movies`** → listeyi göster, DTO döndüğünü vurgula.
7. **Konsol loglarını göster** → `[CQRS] ... başladı / bitti (x ms)`.
   → "Bunun için hiçbir handler'a kod yazmadık, pipeline halkası."
8. **`ApplicationDbContext`'i aç** → soft delete global filter + `IApplicationDbContext` uygulaması.
   → "Application katmanı bu sınıfı hiç görmüyor, sadece arayüzü görüyor."

**Kapanış cümlesi:**
> "Yeni bir feature eklemek 3 dosya yazmak demek: Command, Handler, Validator.
> `Program.cs`'e, DI kayıtlarına, controller altyapısına hiç dokunmuyoruz.
> Bu yüzden üç kişi aynı anda farklı modüllerde çalışabiliyoruz."
