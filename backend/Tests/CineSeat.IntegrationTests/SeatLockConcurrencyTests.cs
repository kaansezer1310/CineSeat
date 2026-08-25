using System.Net;
using System.Net.Http.Json;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Koltuk kilidi, sistemdeki tek gerçek yarış noktası: iki kullanıcı aynı
/// koltuğu aynı anda isteyebilir. Veritabanında (ShowtimeId, SeatId) üzerinde
/// benzersiz dizin var; bu testler o kısıtın gerçekten devrede olduğunu ve
/// kaybeden isteğin anlaşılır bir cevap aldığını ölçüyor.
/// </summary>
[Collection(TestCollection.Name)]
public class SeatLockConcurrencyTests
{
    private readonly CineSeatApiFactory _factory;

    public SeatLockConcurrencyTests(CineSeatApiFactory factory) => _factory = factory;

    private static Task<HttpResponseMessage> LockAsync(HttpClient client, long showtimeId, long seatId) =>
        client.PostAsJsonAsync("/api/seatlocks", new { showtimeId, seatId, lockMinutes = 10 });

    [Fact]
    public async Task Ayni_koltugu_ikinci_kullanici_kilitleyemez()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);

        var birinci = await _factory.AuthenticateAsNewMemberAsync();
        var ikinci = await _factory.AuthenticateAsNewMemberAsync();
        var seatId = scenario.SeatIds[0];

        var ilk = await LockAsync(birinci, scenario.ShowtimeId, seatId);
        var sonra = await LockAsync(ikinci, scenario.ShowtimeId, seatId);

        Assert.Equal(HttpStatusCode.OK, ilk.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, sonra.StatusCode);
    }

    [Fact]
    public async Task Es_zamanli_iki_istekten_yalnizca_biri_kilidi_alir()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);

        var birinci = await _factory.AuthenticateAsNewMemberAsync();
        var ikinci = await _factory.AuthenticateAsNewMemberAsync();
        var seatId = scenario.SeatIds[0];

        // İki istek aynı anda yolda: handler'daki "önce oku, sonra yaz" arası
        // yarışa açık. Veritabanındaki benzersiz dizin son savunma hattı.
        var responses = await Task.WhenAll(
            LockAsync(birinci, scenario.ShowtimeId, seatId),
            LockAsync(ikinci, scenario.ShowtimeId, seatId));

        var basarili = responses.Count(r => r.StatusCode == HttpStatusCode.OK);
        Assert.Equal(1, basarili);

        // Kaybeden istek 500 almamalı: "koltuk kapılmış" anlaşılır bir sonuçtur.
        var kaybeden = responses.Single(r => r.StatusCode != HttpStatusCode.OK);
        Assert.Equal(HttpStatusCode.Conflict, kaybeden.StatusCode);
    }

    [Fact]
    public async Task Ayni_kullanici_tekrar_kilitlerse_suresi_yenilenir()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);

        var uye = await _factory.AuthenticateAsNewMemberAsync();
        var seatId = scenario.SeatIds[0];

        var ilk = await LockAsync(uye, scenario.ShowtimeId, seatId);
        ilk.EnsureSuccessStatusCode();
        var ilkBitis = (await ilk.ReadJsonAsync()).GetProperty("lockExpiresAt").GetDateTimeOffset();

        await Task.Delay(1100);

        var ikinci = await LockAsync(uye, scenario.ShowtimeId, seatId);
        ikinci.EnsureSuccessStatusCode();
        var ikinciBitis = (await ikinci.ReadJsonAsync()).GetProperty("lockExpiresAt").GetDateTimeOffset();

        Assert.True(ikinciBitis > ilkBitis, "Kilit süresi ileri taşınmalıydı.");

        // Aynı koltuk için iki ayrı kilit satırı oluşmamalı.
        var kilitler = await uye.GetAsync($"/api/seatlocks?showtimeId={scenario.ShowtimeId}");
        kilitler.EnsureSuccessStatusCode();
        var payload = await kilitler.ReadJsonAsync();
        Assert.Single(payload.EnumerateArray(), k => k.GetProperty("seatId").GetInt64() == seatId);
    }

    [Fact]
    public async Task Baska_salonun_koltugu_kilitlenemez()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var birinciSalon = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);
        var ikinciSalon = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);

        var uye = await _factory.AuthenticateAsNewMemberAsync();

        // Seans birinci salonda, koltuk ikinci salonda.
        var response = await LockAsync(uye, birinciSalon.ShowtimeId, ikinciSalon.SeatIds[0]);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Baskasinin_koltugunu_iceren_yenileme_tumden_reddedilir()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);

        var sahip = await _factory.AuthenticateAsNewMemberAsync();
        var yabanci = await _factory.AuthenticateAsNewMemberAsync();

        var sahipKoltuk = scenario.SeatIds[0];
        var yabanciKoltuk = scenario.SeatIds[1];

        (await LockAsync(sahip, scenario.ShowtimeId, sahipKoltuk)).EnsureSuccessStatusCode();
        var yabanciKilit = await LockAsync(yabanci, scenario.ShowtimeId, yabanciKoltuk);
        yabanciKilit.EnsureSuccessStatusCode();
        var yabanciIlkBitis = (await yabanciKilit.ReadJsonAsync())
            .GetProperty("lockExpiresAt").GetDateTimeOffset();

        // Yabanci, kendi koltuguyla birlikte baskasinin koltugunu da yenilemek istiyor.
        var response = await yabanci.PostAsJsonAsync("/api/seatlocks/renew", new
        {
            showtimeId = scenario.ShowtimeId,
            seatIds = new[] { sahipKoltuk, yabanciKoltuk },
            lockMinutes = 10
        });

        // Kismi basari yok: istegin tamami reddedilir. Aksi halde kullaniciya
        // "koltuklarin hala senin" demis olurduk.
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

        // Reddedilen istek yabancinin kendi kilidini de uzatmamis olmali.
        var sonrasi = await yabanci.GetAsync($"/api/seatlocks?showtimeId={scenario.ShowtimeId}");
        sonrasi.EnsureSuccessStatusCode();
        var kendiKilidi = (await sonrasi.ReadJsonAsync()).EnumerateArray()
            .Single(k => k.GetProperty("seatId").GetInt64() == yabanciKoltuk);

        // Tam esitlik aranmiyor: PostgreSQL timestamptz mikrosaniye (6 hane)
        // saklarken .NET DateTimeOffset 100 ns (7 hane) tutuyor, son hane
        // gidis-donuste kirpiliyor. Onemli olan surenin ILERI TASINMAMASI;
        // basarili bir yenileme onu saniyeler kadar oteler.
        var kayma = (kendiKilidi.GetProperty("lockExpiresAt").GetDateTimeOffset() - yabanciIlkBitis)
            .Duration();

        Assert.True(
            kayma < TimeSpan.FromMilliseconds(10),
            $"Reddedilen yenileme kilit suresine dokunmamaliydi; {kayma.TotalMilliseconds:F0} ms kaymis.");
    }

    [Fact]
    public async Task Kendi_koltuklarinin_yenilenmesi_calisir()
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);

        var uye = await _factory.AuthenticateAsNewMemberAsync();
        var koltuklar = scenario.SeatIds.Take(2).ToArray();

        foreach (var koltuk in koltuklar)
            (await LockAsync(uye, scenario.ShowtimeId, koltuk)).EnsureSuccessStatusCode();

        await Task.Delay(1100);

        var response = await uye.PostAsJsonAsync("/api/seatlocks/renew", new
        {
            showtimeId = scenario.ShowtimeId,
            seatIds = koltuklar,
            lockMinutes = 10
        });
        response.EnsureSuccessStatusCode();

        var yenilenen = (await response.ReadJsonAsync()).EnumerateArray()
            .Select(k => k.GetProperty("seatId").GetInt64())
            .ToList();

        Assert.Equal(koltuklar.Length, yenilenen.Count);
        Assert.All(koltuklar, koltuk => Assert.Contains(koltuk, yenilenen));
    }
}
