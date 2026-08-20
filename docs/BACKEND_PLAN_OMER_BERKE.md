# CineSeat Backend — İş Planı (2 Kişi: Ömer & Berke)

> Mevcut CQRS mimarisi baz alınmıştır. Amaç: backend'in kalanını iki kişiyle, aynı
> konvansiyonları koruyarak, fazlar halinde tamamlamak. **MediatR ve repository
> kalıplarına birebir uyulmalıdır** — aşağıdaki Bölüm 1 zorunlu referanstır.

---

## 0. Mevcut Durum (snapshot)

**5 projeli Clean/CQRS mimari:**

```
backend/
├─ Core/
│  ├─ CineSeat.Domain         → Entities, Enums (BaseEntity: Id, CreatedAt, UpdatedAt, IsDeleted)
│  └─ CineSeat.Application     → Features (CQRS), Common, Repositories (arayüzler)  [EF YOK]
├─ Infrastructure/
│  ├─ CineSeat.Infrastructure  → şu an ~boş (dış servisler buraya: JWT, mail, ödeme…)
│  └─ CineSeat.Persistence     → DbContext, Migrations, Repository impl, Interceptor, ServiceRegistration
└─ Presentation/
   └─ CineSeat.WebAPI          → Controllers, Middleware, Program.cs
```

**Bağımlılık yönü:** `WebAPI → Application + Persistence + Infrastructure`, `Persistence → Application + Domain`, `Application → Domain`. (Onion korunuyor; Application, EF'i tanımıyor.)

**Hazır altyapı (dokunmadan kullanılacak):**
- MediatR pipeline: `LoggingBehavior` (süre loglar) → `ValidationBehavior` (FluentValidation) → Handler.
- Repository: `IReadRepository<T>` / `IWriteRepository<T>` + entity başına `IXReadRepository`/`IXWriteRepository`.
- `IAsyncQueryExecutor` — Application'ın EF'siz sorgu materyalize etmesini sağlar (`ToListAsync/CountAsync/AnyAsync/FirstOrDefaultAsync`).
- `AuditableEntityInterceptor` — `CreatedAt`/`UpdatedAt`'i **otomatik** doldurur.
- Global **soft-delete filter** — `IsDeleted == true` kayıtlar sorgularda görünmez.
- `Result` / `Result<T>`, `PagedResult<T>` (henüz kullanılmıyor), `NotFoundException` / `ValidationException`, `app.UseExceptionHandling()`.

**Tamamlanan feature'lar:** `Cities` (CreateCity, GetAllCities), `Movies` (CreateMovie + validator, GetMovies).

**Eksikler:** ~19 entity'nin feature'ları, **auth/JWT'nin tamamı**, çoğu command için validator, pagination kullanımı, RBAC, seed data.

---

## 1. Konvansiyonlar — "Bir Feature Nasıl Eklenir" (MediatR odaklı, ZORUNLU)

> Her yeni endpoint bu adımlarla eklenir. Cities/Movies birebir örnektir.

### 1a. Entity için repository (yeni entity ilk kez ele alınıyorsa)

`Core/CineSeat.Application/Repositories/<Entity>/`:
```csharp
public interface IDistrictReadRepository  : IReadRepository<District>  { }
public interface IDistrictWriteRepository : IWriteRepository<District> { }
```
`Infrastructure/CineSeat.Persistence/Repositories/<Entity>/`:
```csharp
public class DistrictReadRepository : ReadRepository<District>, IDistrictReadRepository
{
    public DistrictReadRepository(ApplicationDbContext ctx) : base(ctx) { }
}
public class DistrictWriteRepository : WriteRepository<District>, IDistrictWriteRepository
{
    public DistrictWriteRepository(ApplicationDbContext ctx) : base(ctx) { }
}
```
`Persistence/ServiceRegistration.cs` içine ekle:
```csharp
services.AddScoped<IDistrictReadRepository, DistrictReadRepository>();
services.AddScoped<IDistrictWriteRepository, DistrictWriteRepository>();
```

### 1b. Command (yazma)

`Features/<Entity>/Commands/<Ad>/<Ad>Command.cs`
```csharp
public class CreateDistrictCommand : IRequest<long>
{
    public string DistrictName { get; set; } = string.Empty;
    public long CityId { get; set; }
}
```
`<Ad>CommandHandler.cs`
```csharp
public class CreateDistrictCommandHandler : IRequestHandler<CreateDistrictCommand, long>
{
    private readonly IDistrictWriteRepository _write;
    public CreateDistrictCommandHandler(IDistrictWriteRepository write) => _write = write;

    public async Task<long> Handle(CreateDistrictCommand request, CancellationToken ct)
    {
        var district = new District { DistrictName = request.DistrictName, CityId = request.CityId };
        await _write.AddAsync(district, ct);
        await _write.SaveAsync(ct);
        return district.Id;   // CreatedAt'i ELLE SET ETME — interceptor doldurur
    }
}
```
`<Ad>CommandValidator.cs` (opsiyonel ama önerilir — otomatik çalışır)
```csharp
public class CreateDistrictCommandValidator : AbstractValidator<CreateDistrictCommand>
{
    public CreateDistrictCommandValidator()
    {
        RuleFor(x => x.DistrictName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CityId).GreaterThan(0);
    }
}
```

### 1c. Query (okuma)

`Features/<Entity>/Queries/<Ad>/<Ad>Query.cs`
```csharp
public class GetDistrictsByCityQuery : IRequest<List<DistrictDto>>
{
    public long CityId { get; set; }
}
```
`<Ad>QueryHandler.cs` — **EF'in `ToListAsync`'ini DEĞİL, `IAsyncQueryExecutor`'ı kullan:**
```csharp
public class GetDistrictsByCityQueryHandler : IRequestHandler<GetDistrictsByCityQuery, List<DistrictDto>>
{
    private readonly IDistrictReadRepository _read;
    private readonly IAsyncQueryExecutor _exec;
    public GetDistrictsByCityQueryHandler(IDistrictReadRepository read, IAsyncQueryExecutor exec)
    { _read = read; _exec = exec; }

    public async Task<List<DistrictDto>> Handle(GetDistrictsByCityQuery request, CancellationToken ct)
    {
        var query = _read.GetWhere(d => d.CityId == request.CityId, tracking: false)
            .Select(d => new DistrictDto { Id = d.Id, DistrictName = d.DistrictName });
        return await _exec.ToListAsync(query, ct);
    }
}
```

### 1d. DTO (class) — `Features/<Entity>/DTOs/<Entity>Dto.cs`. Entity'yi ham döndürme.

### 1e. Controller — `Presentation/CineSeat.WebAPI/Controllers/<Entity>Controller.cs`
```csharp
[ApiController]
[Route("api/[controller]")]
public class DistrictsController : ControllerBase
{
    private readonly IMediator _mediator;
    public DistrictsController(IMediator mediator) => _mediator = mediator;

    [HttpPost] public async Task<IActionResult> Create([FromBody] CreateDistrictCommand c)
        => Ok(await _mediator.Send(c));
    [HttpGet]  public async Task<IActionResult> GetByCity([FromQuery] long cityId)
        => Ok(await _mediator.Send(new GetDistrictsByCityQuery { CityId = cityId }));
}
```

### MediatR Altın Kuralları (özenle uyun)

| Kural | Açıklama |
|---|---|
| Command/Query = **`class : IRequest<T>`** | `T` dönüş tipidir (id, DTO, `List<DTO>`, `Result<T>`…) |
| Handler = **`IRequestHandler<TReq, TRes>`** | Ctor'da repository + `IAsyncQueryExecutor` enjekte edilir |
| **DI'a elle EKLEME** | `AddApplicationServices` assembly'i tarar → yeni handler/validator otomatik bulunur |
| Pipeline sırası | Logging → Validation → Handler (dokunulmaz) |
| Controller **ince** | Sadece `_mediator.Send(...)`, iş mantığı yok |
| Okuma tarafı **`IAsyncQueryExecutor`** | Handler'da `using Microsoft.EntityFrameworkCore` OLMAMALI |
| `CreatedAt`/`UpdatedAt` | **Elle set edilmez** — interceptor doldurur |
| Hata | `throw new NotFoundException(...)` / `ValidationException` → middleware çevirir |

---

## 2. İş Bölümü (2 Kişi)

Her kişiye bir "zor" alan + dengeli CRUD verildi. Ayarlanabilir.

| | **Ömer** — Kimlik + Katalog + Sosyal | **Berke** — Konum + Mekan + Rezervasyon |
|---|---|---|
| Zor alan | **Auth & RBAC** (güvenlik) | **Rezervasyon akışı** (eşzamanlılık, transaction) |
| Entity'ler | User, Role, Permission, RolePermission, Movie(tamamla), Genre, MovieGenre, Campaign, UserFavorite, Comment | City(tamamla), District, Cinema, Hall, Technology, HallTech, Seat, Showtime, SeatLock, Reservation, Ticket |

---

## 3. Fazlar

### Faz 1 — Auth Altyapısı (Ömer) + Konum & Sinema (Berke)  *(paralel)*

**Ömer — Auth (kritik yol):**
- [ ] Arayüzler `Application`'da: `ITokenService`, `IPasswordHasher`, `ICurrentUserService`
- [ ] Implementasyonlar **`CineSeat.Infrastructure`** (şu an boş proje bunun için): JWT üretimi (JwtBearer), PBKDF2/BCrypt hash → `Infrastructure/ServiceRegistration.cs` + Program.cs'e `AddInfrastructureServices`
- [ ] `Features/Auth/Commands/Register` + `Login` (Command + Handler + Validator), dönüş `AuthResult` (token + kullanıcı)
- [ ] Program.cs: `AddAuthentication(JwtBearer)` + `AddAuthorization` + `UseAuthentication`
- [ ] Rol/izin **seed** (Admin, User) — Persistence'ta `DbInitializer` (Program.cs başlangıcında)
- [ ] `ICurrentUserService` (WebAPI, `IHttpContextAccessor`)

**Berke — Konum & Sinema:**
- [ ] `City` tamamla: UpdateCity, DeleteCity, GetCityById
- [ ] `District`: CreateDistrict, UpdateDistrict, DeleteDistrict, GetDistrictsByCity (+ read/write repo + register)
- [ ] `Cinema`: Create/Update/Delete/GetById/GetByCity (+ repo)
- [ ] Her feature'ı Bölüm 1 reçetesiyle; en az bir command'a validator yaz (pratik)

**Hedef:** Login token üretiyor; Berke pattern'e hakim; konum+sinema tam.

### Faz 2 — Katalog (Ömer) + Salon/Koltuk/Seans (Berke)

**Ömer — Katalog:**
- [ ] `Movie` tamamla: UpdateMovie, DeleteMovie, GetMovieById, GetMovies'e **filtre + pagination** (`PagedResult<MovieDto>`)
- [ ] `Genre`: CRUD
- [ ] `MovieGenre`: AssignGenreToMovie, RemoveGenreFromMovie, GetGenresOfMovie
- [ ] `Campaign`: CRUD + GetActiveCampaigns

**Berke — Mekan & Seans:**
- [ ] `Hall`: CRUD (Cinema'ya bağlı)
- [ ] `Technology`: CRUD · `HallTech`: AssignTechToHall / RemoveTech / GetTechsOfHall
- [ ] `Seat`: CreateSeats (toplu üretim), GetSeatMap (salona göre)
- [ ] `Showtime`: Create/Update/Delete/GetById/GetByMovie/GetByCinema (Movie[Ömer] + Hall[kendi] FK)

**Hedef:** katalog + mekan + seanslar tam sorgulanabilir.

### Faz 3 — Rezervasyon Akışı (Berke, EN ZOR) + Sosyal & Profil (Ömer)

**Berke — Rezervasyon:**
- [ ] `SeatLock`: LockSeat, ReleaseSeat — `ShowtimeId+SeatId` **unique index** çift kilidi DB'de engeller; çakışmada `ConflictException`
- [ ] `Reservation`: CreateReservation — koltuk müsaitlik doğrulama, fiyat = seans `BasePrice` × koltuklar − kampanya indirimi, **tek transaction** (`AddRangeAsync` + tek `SaveAsync`)
- [ ] GetMyReservations (current user), CancelReservation
- [ ] `Ticket`: IssueTicket (rezervasyon onayında), GetTicketById

**Ömer — Sosyal & Profil:**
- [ ] `UserFavorite`: AddFavorite, RemoveFavorite, GetMyFavorites (current user)
- [ ] `Comment`: AddComment, DeleteComment, GetCommentsByMovie (+ `Movie.AvgScore` güncelle)
- [ ] `User`: GetProfile, UpdateProfile
- [ ] RBAC: `[Authorize(Roles = "Admin")]` yazma/silme endpoint'lerine; gerekirse permission tabanlı policy

**Hedef:** uçtan uca rezervasyon + sosyal özellikler.

### Faz 4 — Kalite, Güvenlik, Bitiş  *(birlikte)*

- [ ] Tüm command'lara validator; tüm liste endpoint'lerine **pagination** (`PagedResult<T>`)
- [ ] `[Authorize]` rolleri her endpoint'e doğru uygulanmış mı gözden geçir
- [ ] **Soft-delete kararı uygula** (Bölüm 5) — Remove'lar `IsDeleted=true` mı olacak
- [ ] Seed genişletme: admin kullanıcı, türler, şehir/ilçe örnekleri
- [ ] **Swagger'a JWT** (Authorize butonu) + tüm endpoint'leri elle test
- [ ] Uçtan uca smoke test + kısa README
- Bölüşüm: **Ömer** güvenlik/auth/Swagger-JWT · **Berke** pagination/seed/liste standardı · ikisi cross-review

---

## 4. Bağımlılık & Sıra (kim kimi bekler)

- **Berke → Ömer'i bekler:** korumalı endpoint'lere `[Authorize]` koymak için Faz 1 auth'u (ama feature'ları auth'suz yazıp sonra kilitleyebilir).
- **Showtime (Berke) → Movie (Ömer):** seans filmi FK'lar; Ömer'in Movie'si veya seed film yeterli.
- **Reservation (Berke) → Showtime + Seat (kendi) + Campaign (Ömer):** kampanya indirimi Ömer'in Campaign'ine bağlı — o gelene kadar indirimsiz yazılabilir.
- **Kritik yol:** `Faz 1 Auth → korumalı özellikler` ve `Showtime → Reservation`.

---

## 5. Karara Bağlanacak Açık Noktalar

1. **Soft-delete vs hard-delete:** `WriteRepository.Remove/RemoveAsync` şu an **hard delete** yapıyor, ama global filter + `IsDeleted` **soft-delete** ima ediyor. Karar gerek. *Öneri: soft-delete* (Remove yerine `IsDeleted=true` + `Update`) — filter zaten hazır.
2. **Dış servislerin yeri:** JWT/hashing → `CineSeat.Infrastructure` (boş proje bunun için). Arayüz Application'da, impl Infrastructure'da, DI Infrastructure'da.
3. **`ICurrentUserService`:** arayüz Application, impl WebAPI (`IHttpContextAccessor`).
4. **Pagination standardı:** liste endpoint'leri `List<Dto>` mı `PagedResult<Dto>` mı? *Öneri: büyük listeler `PagedResult`.*
5. **Result<T> vs exception:** Beklenen iş-kuralı hataları `Result.Failure(...)` mı, exception mı? Şu an karışık (query'ler ham değer, hatalar exception). *Öneri: beklenen hatalar `Result`, gerçek istisnalar exception.*

---

## 6. Git Akışı & Definition of Done

```
main (korumalı)
 ├─ feature/omer-auth-catalog-social
 └─ feature/berke-location-venue-booking
```
- Herkes kendi `Features/<Entity>/` ve `Controllers/` dosyalarında → çakışma minimum.
- Ortak dosyalar (`ServiceRegistration.cs` repo kaydı, `Program.cs`) küçük ve dikkatli düzenlenir; sık `main` çek.
- PR → en az 1 review → main.

**Definition of Done (her feature):** Command/Query + Handler ✔ · (write ise) Validator ✔ · read/write repo + register ✔ · DTO ✔ · Controller endpoint ✔ · `IAsyncQueryExecutor` kullanıldı (query'de EF yok) ✔ · Swagger'dan test ✔ · PR review ✔

---

## Kaba Zaman Çizelgesi

| Faz | Ömer | Berke | Süre |
|---|---|---|---|
| 1 | Auth + RBAC iskeleti | Konum + Sinema | ~4-5 gün |
| 2 | Katalog (Movie/Genre/Campaign) | Mekan + Seans | ~4-6 gün |
| 3 | Sosyal + Profil | Rezervasyon + Bilet | ~5-7 gün |
| 4 | Güvenlik/Swagger | Pagination/Seed | ~2-3 gün |
| **Toplam** | | | **~3-4 hafta** |
