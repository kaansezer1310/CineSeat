using CineSeat.Api;
using CineSeat.Api.Middleware;
using CineSeat.Application;
using CineSeat.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Her katman kendi DI kaydını kendi DependencyInjection.cs dosyasında yapar.
// Yeni bir Command/Query/Handler eklerken bu dosyaya DOKUNULMAZ.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApi();

var app = builder.Build();

// Uygulamadaki tek hata yakalama noktası — pipeline'ın en dışında olmalı.
app.UseExceptionHandling();

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
