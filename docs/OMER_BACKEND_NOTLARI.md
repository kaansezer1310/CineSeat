# Ömer — Backend Çalışma Notları

> Bu dosya `BACKEND_PLAN_OMER_BERKE.md`'deki Ömer fazlarının (Auth/RBAC, Katalog,
> Sosyal & Profil) tamamlanmasını ve bu iş sırasında Berke'nin tarafında kapatılan
> güvenlik açıklarını kayda geçirir.
>
> **Commit:** `2f8700a` · **Branch:** `omer-cqrs-port` · **Tarih:** 19.08.2026

---

## 1. Ne yapıldı

### Faz 1 — Auth & RBAC

| Katman | Eklenenler |
|---|---|
| **Application** | `ITokenService`, `IPasswordHasher`, `ICurrentUserService` arayüzleri · `UnauthorizedException` · `RoleNames` sabitleri · `Features/Auth` (Register + Login: command/handler/validator) |
| **Infrastructure** | Boş olan proje dolduruldu: `JwtTokenService` (HS256), `Pbkdf2PasswordHasher`, `JwtSettings`, `AddInfrastructureServices` |
| **Persistence** | 9 entity için read/write repository + DI kayıtları · `DbInitializer`'a rol/izin/admin seed'i |
| **WebAPI** | `CurrentUserService` (IHttpContextAccessor) · `AuthController` · `Program.cs`'te JwtBearer pipeline · Swagger "Authorize" butonu · 401 middleware eşlemesi |

**Bilinçli güvenlik kararları:**

- `RegisterCommand` **rol kabul etmez** — herkes `User` rolüyle başlar. Aksi halde
  isteyen kendini Admin yapardı.
- `Login`, "kullanıcı yok" ile "parola yanlış" için **aynı mesajı** döner. Farklı
  mesaj vermek hangi e-postaların kayıtlı olduğunu sızdırır.
- `Jwt:Key` 32 karakterden kısaysa **uygulama açılışta patlar** — kısa HMAC anahtarı
  imza güvenliğini çökertir, sessizce geçilmemeli.
- `ClockSkew = TimeSpan.Zero` — varsayılan 5 dakikalık tolerans süresi dolmuş
  token'ı bir süre daha geçerli sayıyordu.
- PBKDF2: 100.000 iterasyon, HMAC-SHA256, kayıt başına rastgele salt,
  `CryptographicOperations.FixedTimeEquals` ile sabit zamanlı karşılaştırma
  (normal `==` ilk farklı baytta çıkar ve zamanlama saldırısına açık kapı bırakır).

### Faz 2 — Katalog

- **Movie:** `UpdateMovie`, `DeleteMovie`, gerçek `GetMovieById`
  *(eski `GetById` tüm listeyi çekip bellekte filtreliyordu — controller içinde
  `GetMoviesQuery { PageSize = 100 }` gönderip `FirstOrDefault` yapıyordu)*
- **Genre:** tam CRUD. Filme atanmış bir tür silinmek istenirse FK hatası yerine
  anlaşılır `409` döner.
- **MovieGenre:** `AssignGenreToMovie`, `RemoveGenreFromMovie`, `GetGenresOfMovie`
- **Campaign:** tam CRUD + `GetActiveCampaigns`. Rezervasyonlarda kullanılmış bir
  kampanya silinemez (geçmiş kayıtları bozardı) — `IsActive=false` önerilir.

### Faz 3 — Sosyal & Profil

- **UserFavorite:** ekle / kaldır / listele (sayfalı)
- **Comment:** ekle / sil / filme göre listele (sayfalı).
  Bir kullanıcı bir filme **tek yorum** yazabilir — aksi halde puan ortalaması
  tekrar tekrar yorum yazılarak manipüle edilebilirdi.
- **`MovieScoreCalculator`:** `Movie.AvgScore`'u yorumlardan yeniden hesaplar.
  `GroupBy + Select` ile **tek SQL sorgusu** — bütün yorumları belleğe çekip
  ortalama almaktan çok daha ucuz. Yorum eklendiğinde ve silindiğinde çalışır.
- **Profil:** oku / güncelle. `Email`, `Username` ve `Role` **bilinçli olarak
  güncellenemez** — kimlik alanları doğrulama gerektiren ayrı bir akış, rol
  değişimi ise yetki yükseltme demektir.

**Kullanıcı kimliği hiçbir yerde istekten alınmaz** — favori, yorum ve profilde
`ICurrentUserService` üzerinden token'dan okunur.

---

## 2. Berke'nin tarafında kapatılan güvenlik açıkları

Berke koda 2 TODO bırakmıştı (*"auth eklenince current user'dan alınmalı"*).
Onları yaparken **3 tane daha IDOR** çıktı.

| Uç nokta | Açık | Çözüm |
|---|---|---|
| `GET /Reservations/my?userId=` | Herkes başkasının rezervasyon listesini görebiliyordu | `UserId` komuttan kaldırıldı, token'dan |
| `POST /Reservations` | Başkası adına rezervasyon yapılabiliyordu | Aynı |
| `POST /Reservations/{id}/cancel` | id tahmin eden başkasının rezervasyonunu iptal edebiliyordu | Aynı + Admin istisnası |
| `POST /SeatLocks` | Başkasının adına koltuk kilitlenebiliyordu | Aynı |
| `DELETE /SeatLocks/{id}` | **Herkes başkasının kilidini açıp koltuğu kapabiliyordu** | Sahiplik kontrolü |
| `GET /Reservations/{id}` | **id deneyen herkes alıcı adı / e-posta / tutar okuyabiliyordu** | Sahiplik kontrolü |
| `GET /Tickets/{id}` | **Aynı** | Sahiplik kontrolü |
| `GET /Tickets/by-reservation/{id}` | **Aynı** | Sahiplik kontrolü |

> **Neden hepsi `404`, `403` değil:** `403` "bu kayıt var ama senin değil"
> bilgisini sızdırır. Yetkisiz erişimde kaydın **varlığını bile** sızdırmamak için
> `NotFoundException` fırlatılıyor.

### Kampanya indirimi devreye alındı

Berke'nin diğer TODO'su: *"Kampanya indirimi HENÜZ uygulanmaz (Ömer'in Campaign
işi bu branch'te yok)"*. Campaign geldiğine göre `CreateReservation`'a bağlandı:

- Kampanya var mı → yoksa `404`
- Aktif mi → değilse `409`
- Sepet `MinCartTotal` eşiğini geçiyor mu → geçmiyorsa `409`
- `Percentage` → `subtotal × Value / 100` · `FixedAmount` → `Value`
- **İndirim ara toplamı asla aşamaz** (`Math.Min`) — aşsaydı `Total` negatife düşerdi
- `MembersOnly` ayrıca kontrol edilmiyor: rezervasyon zaten giriş gerektiriyor,
  yani buraya gelen herkes üye.

### RBAC uygulaması

Referans/mekan yazma uçlarının hepsine `[Authorize(Roles = RoleNames.Admin)]`:
`Cities`, `Districts`, `Cinemas`, `Halls`, `Technologies`, `HallTechs`, `Seats`,
`Showtimes`. Okuma uçları herkese açık kaldı (koltuk haritası, seans listesi vb.
anonim ziyaretçiye lazım).

---

## 3. Karara bağlanan konvansiyonlar

Planın §5'indeki açık noktalardan ikisi kapandı:

**Dönüş tipi (§5.5) — exception:**

| | |
|---|---|
| Command | `long` (yeni id) veya `Unit` |
| Query | `Dto` / `List<Dto>` / `PagedResult<Dto>` |
| Hata | `NotFoundException` · `ConflictException` · `UnauthorizedException` · `ValidationException` → middleware çevirir |

Movies feature'ı `Result<T>`'den bu stile çevrildi, **kod tabanı artık tek stil**.

**Silme (§5.1) — hard delete korundu.** Mevcut 11 delete handler'ının davranışı
buydu; değiştirmek Berke'nin kodunun davranışını sessizce değiştirirdi. Karar
Faz 4'e ertelendi — global soft-delete filter zaten hazır, geçiş isteniyorsa
`WriteRepository.Remove` tek noktadan değiştirilir.

---

## 4. Test edildi (canlı API + PostgreSQL)

```
register 201 · aynı e-posta 409 · zayıf parola 400 (Türkçe doğrulama mesajlarıyla)
login OK · yanlış parola 401 (kullanıcı yok ile ayırt edilemez mesaj)

genre POST:  token yok 401 → normal user 403 → admin 201 → tekrar 409
yorum 5★ + 4★ → AvgScore 4.50 · admin yorumu silindi → AvgScore 5.00
user başkasının yorumunu silemiyor 401 · admin silebiliyor 204 (moderasyon)
kampanya: anonim ['Yaz Indirimi'] · üye ['Uye Ozel','Yaz Indirimi']   ← MembersOnly
yüzde 150 indirim 400 · kullanımdaki tür silme 409

koltuk kilidi: user kilitledi → saldırgan aynı koltuk 409 → saldırgan kilidi açamıyor 404
rezervasyon:   175 TL sepet + %15 kampanya → 26.25 indirim → 148.75 toplam
IDOR:          saldırgan rezervasyon/bilet okuyamıyor 404 · sahibi ve admin okuyor 200
               ?userId=2 ile başkasının listesi → 0 kayıt
admin-only:    Cities/Districts/Cinemas/Halls/Technologies/Showtimes/Seats
               anonim 401 · normal kullanıcı 403
```

**Seed sonrası admin hesabı:** `admin@cineseat.com` / `Admin123!`
Sadece geliştirme içindir, prod'a çıkmadan değiştirilmeli.

Swagger: `http://localhost:5207/swagger` → sağ üstteki **Authorize** butonuna
login'den dönen token yapıştırılır (`Bearer ` öneki gerekmez).

---

## 5. Açık kalan işler

1. **`Result` / `Result<T>` artık kullanılmıyor.**
   `Common/Models/Result.cs` — Movies exception stiline çevrilince son kullanıcısı
   da kalmadı. Silinmeye hazır ama Berke'nin de görüş alanında olduğu için
   kendiliğimden kaldırmadım. Karar ortak verilsin.

2. **`Jwt:Key` appsettings.json'da düz metin.**
   `"cineseat-development-only-signing-key-change-me-in-production"` — geliştirme
   için sorun değil ama repoya girdi. Prod'a çıkarken user-secrets veya ortam
   değişkenine taşınmalı, anahtar da yenilenmeli.

3. **Soft-delete kararı (Plan §5.1)** — hâlâ açık, Faz 4'te.

4. **README yazılmadı** — plandaki Faz 4 maddesi. Smoke test yapıldı, dokümantasyon
   olarak sadece bu dosya var.

5. **Permission tabanlı policy kurulmadı.** İzinler (`movie.manage`, `cinema.manage`
   vb.) seed ediliyor ve `RolePermission` ile Admin'e bağlanıyor, ama yetkilendirme
   şu an **rol bazlı** (`[Authorize(Roles = "Admin")]`). Daha ince yetki gerekirse
   izinler hazır bekliyor.

6. **`Comment.IsEdited` alanı kullanılmıyor** — planda `UpdateComment` yoktu,
   o yüzden yorum düzenleme akışı yazılmadı. Alan şemada duruyor.
