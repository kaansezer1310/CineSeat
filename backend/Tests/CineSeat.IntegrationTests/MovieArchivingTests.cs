using System.Net;
using System.Net.Http.Json;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Film silme "arşivleme" (soft-delete) olarak tanımlı: kayıt veritabanında
/// kalır, listelerden düşer, geri alınabilir. Bu testler arşivlenmiş bir
/// kaydın hangi uçtan görünüp hangisinden görünmediğini sabitliyor.
/// </summary>
[Collection(TestCollection.Name)]
public class MovieArchivingTests
{
    private readonly CineSeatApiFactory _factory;

    public MovieArchivingTests(CineSeatApiFactory factory) => _factory = factory;

    private static async Task<long> CreateMovieAsync(HttpClient admin, string title)
    {
        var response = await admin.PostAsJsonAsync("/api/movies", new
        {
            title,
            duration = (short)120,
            description = "Arsivleme testi.",
            ageLimit = (short)0,
            language = "Turkce",
            poster = "/posters/test.svg",
            startDate = DateTime.UtcNow.AddDays(-1),
            endDate = DateTime.UtcNow.AddDays(30)
        });

        response.EnsureSuccessStatusCode();
        var payload = await response.ReadJsonAsync();

        return payload.ValueKind == System.Text.Json.JsonValueKind.Number
            ? payload.GetInt64()
            : payload.GetProperty("id").GetInt64();
    }

    private static async Task<bool> ListContainsAsync(HttpClient client, string path, long movieId)
    {
        var response = await client.GetAsync(path);
        response.EnsureSuccessStatusCode();

        var payload = await response.ReadJsonAsync();
        var items = payload.ValueKind == System.Text.Json.JsonValueKind.Array
            ? payload
            : payload.GetProperty("items");

        return items.EnumerateArray().Any(m => m.GetProperty("id").GetInt64() == movieId);
    }

    [Fact]
    public async Task Arsivlenen_film_genel_listeden_dusuyor()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var movieId = await CreateMovieAsync(admin, $"Arsiv Testi {Guid.NewGuid():N}"[..40]);

        Assert.True(await ListContainsAsync(admin, "/api/movies?pageSize=100", movieId));

        var silme = await admin.DeleteAsync($"/api/movies/{movieId}");
        silme.EnsureSuccessStatusCode();

        Assert.False(await ListContainsAsync(admin, "/api/movies?pageSize=100", movieId));
    }

    [Fact]
    public async Task Arsivlenen_film_arsiv_listesinde_gorunuyor()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var movieId = await CreateMovieAsync(admin, $"Arsiv Testi {Guid.NewGuid():N}"[..40]);

        Assert.False(await ListContainsAsync(admin, "/api/movies/archived?pageSize=100", movieId));

        (await admin.DeleteAsync($"/api/movies/{movieId}")).EnsureSuccessStatusCode();

        Assert.True(await ListContainsAsync(admin, "/api/movies/archived?pageSize=100", movieId));
    }

    [Fact]
    public async Task Arsivlenen_film_geri_alinabiliyor()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var movieId = await CreateMovieAsync(admin, $"Arsiv Testi {Guid.NewGuid():N}"[..40]);

        (await admin.DeleteAsync($"/api/movies/{movieId}")).EnsureSuccessStatusCode();

        var geriAl = await admin.PostAsync($"/api/movies/{movieId}/restore", null);
        geriAl.EnsureSuccessStatusCode();

        // Geri gelen film yeniden genel listede, arsivde degil.
        Assert.True(await ListContainsAsync(admin, "/api/movies?pageSize=100", movieId));
        Assert.False(await ListContainsAsync(admin, "/api/movies/archived?pageSize=100", movieId));
    }

    [Fact]
    public async Task Arsivlenen_film_kayitlari_silinmiyor()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var baslik = $"Arsiv Kalici {Guid.NewGuid():N}"[..40];
        var movieId = await CreateMovieAsync(admin, baslik);

        (await admin.DeleteAsync($"/api/movies/{movieId}")).EnsureSuccessStatusCode();

        // Arsiv listesinde ayni kimlikle ve ayni basligla duruyorsa satir
        // gercekten silinmemis demektir.
        var response = await admin.GetAsync("/api/movies/archived?pageSize=100");
        response.EnsureSuccessStatusCode();

        var payload = await response.ReadJsonAsync();
        var items = payload.ValueKind == System.Text.Json.JsonValueKind.Array
            ? payload
            : payload.GetProperty("items");

        var arsivlenen = items.EnumerateArray()
            .Single(m => m.GetProperty("id").GetInt64() == movieId);

        Assert.Equal(baslik, arsivlenen.GetProperty("title").GetString());
    }

    [Fact]
    public async Task Arsiv_listesi_izin_istiyor()
    {
        var uye = await _factory.AuthenticateAsNewMemberAsync();

        var response = await uye.GetAsync("/api/movies/archived");

        // Arsiv yonetim verisi; movie.manage izni olmayan gormemeli.
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
