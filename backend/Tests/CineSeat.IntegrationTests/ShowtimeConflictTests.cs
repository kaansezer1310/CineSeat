using System.Net;
using System.Net.Http.Json;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Aynı salona çakışan seans açılamaz. Koltuk kilitleri ve rezervasyonlar
/// seans bazlı olduğu için, çakışan iki seans aynı koltukları birbirinden
/// habersiz satardı.
///
/// Bir seansın salonu işgal ettiği aralık: film süresi + temizlik payı.
/// Sınır yarı açık — bir seans, tam olarak diğerinin bittiği anda başlayabilir.
/// </summary>
[Collection(TestCollection.Name)]
public class ShowtimeConflictTests
{
    private const int CleanupMinutes = 20;
    private const short FilmSuresi = 100;

    private readonly CineSeatApiFactory _factory;

    public ShowtimeConflictTests(CineSeatApiFactory factory) => _factory = factory;

    private static Task<HttpResponseMessage> CreateShowtimeAsync(
        HttpClient admin, long movieId, long hallId, DateTimeOffset startsAt) =>
        admin.PostAsJsonAsync("/api/showtimes", new
        {
            movieId,
            hallId,
            startDatetime = startsAt,
            basePrice = 150m,
            format = "Standard2D"
        });

    [Fact]
    public async Task Ayni_salonda_ayni_saate_ikinci_seans_acilamaz()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(
            admin, _factory, movieDurationMinutes: FilmSuresi,
            startsAt: DateTimeOffset.UtcNow.AddDays(10));

        var ilkBaslangic = DateTimeOffset.UtcNow.AddDays(10);

        var response = await CreateShowtimeAsync(
            admin, scenario.MovieId, scenario.HallId, ilkBaslangic);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Film_bitmeden_baslayan_seans_reddedilir()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var baslangic = DateTimeOffset.UtcNow.AddDays(11);
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(
            admin, _factory, movieDurationMinutes: FilmSuresi, startsAt: baslangic);

        // Film daha bitmemisken baslamaya calisiyor.
        var response = await CreateShowtimeAsync(
            admin, scenario.MovieId, scenario.HallId, baslangic.AddMinutes(FilmSuresi - 10));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Temizlik_payi_dolmadan_baslayan_seans_reddedilir()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var baslangic = DateTimeOffset.UtcNow.AddDays(12);
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(
            admin, _factory, movieDurationMinutes: FilmSuresi, startsAt: baslangic);

        // Film bitti ama temizlik payi dolmadi (1 dakika eksik).
        var response = await CreateShowtimeAsync(
            admin, scenario.MovieId, scenario.HallId,
            baslangic.AddMinutes(FilmSuresi + CleanupMinutes - 1));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Temizlik_payi_dolduktan_sonra_seans_acilabilir()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var baslangic = DateTimeOffset.UtcNow.AddDays(13);
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(
            admin, _factory, movieDurationMinutes: FilmSuresi, startsAt: baslangic);

        // Tam sinir: onceki seansin isgal araligi bittigi an. Yari acik
        // aralik oldugu icin kabul edilmeli.
        var response = await CreateShowtimeAsync(
            admin, scenario.MovieId, scenario.HallId,
            baslangic.AddMinutes(FilmSuresi + CleanupMinutes));

        response.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Farkli_salonlarda_ayni_saat_serbest()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var baslangic = DateTimeOffset.UtcNow.AddDays(14);

        var birinci = await TestScenarioBuilder.CreateShowtimeAsync(
            admin, _factory, movieDurationMinutes: FilmSuresi, startsAt: baslangic);
        var ikinci = await TestScenarioBuilder.CreateShowtimeAsync(
            admin, _factory, movieDurationMinutes: FilmSuresi, startsAt: baslangic);

        // Iki ayri salon; cakisma salona bagli oldugu icin ikisi de acilabildi.
        Assert.NotEqual(birinci.HallId, ikinci.HallId);
        Assert.NotEqual(birinci.ShowtimeId, ikinci.ShowtimeId);
    }

    [Fact]
    public async Task Gecmise_seans_acilamaz()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);

        var response = await CreateShowtimeAsync(
            admin, scenario.MovieId, scenario.HallId, DateTimeOffset.UtcNow.AddHours(-1));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Seans_kendisiyle_cakismaz()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var baslangic = DateTimeOffset.UtcNow.AddDays(15);
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(
            admin, _factory, movieDurationMinutes: FilmSuresi, startsAt: baslangic);

        // Ayni seans ayni saatle guncelleniyor: kendi kaydi cakisma sayilmamali.
        var response = await admin.PutAsJsonAsync($"/api/showtimes/{scenario.ShowtimeId}", new
        {
            id = scenario.ShowtimeId,
            movieId = scenario.MovieId,
            hallId = scenario.HallId,
            startDatetime = baslangic,
            basePrice = 175m,
            format = "Standard2D"
        });

        response.EnsureSuccessStatusCode();
    }
}
