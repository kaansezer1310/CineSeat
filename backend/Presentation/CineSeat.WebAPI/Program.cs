using CineSeat.Application;
using CineSeat.Persistence;
using CineSeat.Persistence.Data;
using CineSeat.WebAPI.Middleware;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add Application Layer Services
builder.Services.AddApplicationServices();

// Add Persistence Layer Services
builder.Services.AddPersistenceServices(builder.Configuration);

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Başlangıçta bekleyen migration'ları uygula + örnek referans verisini (şehir/ilçe) ekle.
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbInitializer.SeedAsync(context);
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

app.UseAuthorization();

app.MapControllers();

app.Run();
