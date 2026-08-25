using CineSeat.Persistence.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Uygulamayı bellekte ayağa kaldırır ve <b>ayrı</b> bir PostgreSQL
/// veritabanına yönlendirir. Geliştirme veritabanına hiç dokunulmaz.
///
/// Ortam "Testing" seçiliyor: <c>DbInitializer</c> (rol, izin, admin, şehir)
/// yine çalışıyor, ancak <c>DemoDataSeeder</c> yalnızca Development'ta devreye
/// girdiği için demo katalog eklenmiyor. Böylece testler seed içeriğinin
/// değişmesine bağımlı olmuyor; ihtiyaç duydukları kaydı kendileri kuruyor.
/// </summary>
public class CineSeatApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private const string TestDatabase = "CineSeatDb_IntegrationTests";

    private static readonly string AdminConnectionString =
        "Host=localhost;Port=5432;Database=postgres;Username=postgres;Password=postgres;";

    public static readonly string TestConnectionString =
        $"Host=localhost;Port=5432;Database={TestDatabase};Username=postgres;Password=postgres;";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.UseSetting("ConnectionStrings:DefaultConnection", TestConnectionString);
    }

    /// <summary>
    /// Her test turu temiz bir veritabanıyla başlar. Migration'lar ve referans
    /// verisi uygulamanın kendi başlangıç kodunda uygulanıyor; burada yalnızca
    /// önceki turdan kalan veritabanı düşürülüyor.
    /// </summary>
    // IAsyncLifetime açıkça uygulanıyor: xUnit'in DisposeAsync'i Task döndürürken
    // WebApplicationFactory'ninki ValueTask döndürüyor, aynı adla çakışıyorlar.
    async Task IAsyncLifetime.InitializeAsync()
    {
        await DropTestDatabaseAsync();

        // İlk istemci, uygulamanın başlangıcını (migrate + seed) tetikler.
        using var client = CreateClient();
        using var response = await client.GetAsync("/api/movies");
        response.EnsureSuccessStatusCode();
    }

    // Uygulama örneğini xUnit koleksiyon fixture'ı elden çıkarıyor;
    // temizlik için ayrıca yapılacak bir şey yok.
    Task IAsyncLifetime.DisposeAsync() => Task.CompletedTask;

    /// <summary>Testin doğrudan veritabanına bakabilmesi için yeni bir kapsam açar.</summary>
    public AsyncServiceScope CreateAsyncScope() => Services.CreateAsyncScope();

    public static ApplicationDbContext DbContextFrom(AsyncServiceScope scope) =>
        scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    private static async Task DropTestDatabaseAsync()
    {
        await using var connection = new NpgsqlConnection(AdminConnectionString);
        await connection.OpenAsync();

        // Açık oturumlar DROP DATABASE'i engeller.
        await using (var terminate = new NpgsqlCommand(
            $"""
             SELECT pg_terminate_backend(pid) FROM pg_stat_activity
             WHERE datname = '{TestDatabase}' AND pid <> pg_backend_pid();
             """, connection))
        {
            await terminate.ExecuteNonQueryAsync();
        }

        await using var drop = new NpgsqlCommand(
            $"DROP DATABASE IF EXISTS \"{TestDatabase}\";", connection);
        await drop.ExecuteNonQueryAsync();
    }
}
