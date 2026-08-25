using System.Text;
using System.Text.Json.Serialization;
using CineSeat.Application;
using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Infrastructure;
using CineSeat.Infrastructure.Security;
using CineSeat.Persistence;
using CineSeat.Persistence.Data;
using CineSeat.WebAPI.Middleware;
using CineSeat.WebAPI.OpenApi;
using CineSeat.WebAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add Application Layer Services
builder.Services.AddApplicationServices();

// Add Persistence Layer Services
builder.Services.AddPersistenceServices(builder.Configuration);

// Add Infrastructure Layer Services (JWT üretimi, parola hash'leme)
builder.Services.AddInfrastructureServices(builder.Configuration);

// ICurrentUserService'in HttpContext'e erişebilmesi için gerekli.
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// ---- Kimlik doğrulama (JWT Bearer) ----
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException(
        "appsettings.json içinde 'Jwt' bölümü bulunamadı. Issuer/Audience/Key tanımlanmalı.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
{
    // HS256 anahtarı kısa olursa imza güvenliği çöker; sessizce geçmek yerine
    // uygulama açılışta patlasın.
    throw new InvalidOperationException("Jwt:Key en az 32 karakter olmalıdır.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            // Varsayılan 5 dakikalık tolerans, süresi dolmuş token'ı bir süre
            // daha geçerli sayar. Sıfırlıyoruz.
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    foreach (var permission in PermissionNames.All)
    {
        options.AddPolicy(
            permission,
            policy => policy.RequireClaim(PermissionClaimTypes.Permission, permission));
    }
});

// ---- CORS: frontend (Vite, farklı port) tarayıcıdan istek atabilsin ----
// Farklı origin (host+port) demek, tarayıcının bu isteği varsayılan olarak
// engellediği anlamına gelir. Backend açıkça izin vermezse frontend hiçbir
// API çağrısı yapamaz — token/kod doğru olsa bile.
const string FrontendCorsPolicy = "FrontendCorsPolicy";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Enum'lar JSON'da sayi degil ad olarak tasinir ("Adult", "IMAX").
// Sayi tasindiginda istemci tarafinda ayri bir eslesme tablosu tutmak
// gerekiyordu; enum'a yeni deger eklendiginde iki taraf sessizce ayrisirdi.
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter()));
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi(options =>
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>());

var app = builder.Build();

// Başlangıçta bekleyen migration'ları uygula + referans verisini
// (rol/izin/admin, şehir/ilçe) ekle.
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await DbInitializer.SeedAsync(context, passwordHasher);

    // Örnek katalog (film, sinema, salon, koltuk, seans, kampanya) YALNIZCA
    // geliştirme ortamında eklenir. Canlıda demo film/sinema kaydı istemiyoruz;
    // ayrıca ekipteki herkesin aynı veriyle çalışmasını sağlar.
    if (app.Environment.IsDevelopment())
    {
        await DemoDataSeeder.SeedAsync(context);
    }
}

// Uygulamadaki tek hata yakalama noktası — pipeline'ın en dışında olmalı.
app.UseExceptionHandling();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // /openapi/v1.json belgesini üretir, /swagger adresinde arayüzle sunar.
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "CineSeat API v1");
        options.RoutePrefix = "swagger";
    });
}

// Geliştirmede HTTPS'e zorlamıyoruz: frontend (Vite) http://localhost:5207'ye
// istek atıyor; bu yönlendirme devrede olsaydı tarayıcı 307 ile https'e
// (güvenilmeyen dev sertifikalı 7085 portuna) yönlendirilir ve fetch, CORS
// hatasına benzeyen ama aslında "sertifikaya güvenilmedi" kaynaklı bir ağ
// hatasıyla sessizce başarısız olurdu.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// CORS, kimlik doğrulamadan ÖNCE gelmeli — tarayıcı asıl isteği göndermeden
// önce bir "preflight" (OPTIONS) isteği atar, bu istek hiç token taşımaz.
app.UseCors(FrontendCorsPolicy);

// SIRA ÖNEMLİ: önce kimlik doğrulama (sen kimsin), sonra yetkilendirme (yetkin var mı).
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Entegrasyon testleri WebApplicationFactory<Program> ile bu uygulamayı ayağa
// kaldırıyor. Top-level statement'lar Program sınıfını `internal` ürettiği için
// test projesinden görünür olması adına burada açıkça public yapılıyor.
public partial class Program;
