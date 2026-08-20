using System.Text;
using CineSeat.Application;
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

builder.Services.AddAuthorization();

builder.Services.AddControllers();
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

app.UseHttpsRedirection();

// SIRA ÖNEMLİ: önce kimlik doğrulama (sen kimsin), sonra yetkilendirme (yetkin var mı).
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
