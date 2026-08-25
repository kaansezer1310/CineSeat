using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Rezervasyon; alıcı adı, e-postası ve tutarı taşıyor. Bu yüzden okuma iki
/// kapıdan geçiyor: ya kaydın sahibisin ya da reservation.read iznin var.
///
/// Yetkisiz erişimde 403 değil <b>404</b> dönülüyor — bilinçli bir tercih:
/// 403, "böyle bir rezervasyon var ama sana kapalı" bilgisini sızdırırdı ve
/// id deneyen biri geçerli numaraları haritalayabilirdi.
/// </summary>
[Collection(TestCollection.Name)]
public class ReservationOwnershipTests
{
    private readonly CineSeatApiFactory _factory;

    public ReservationOwnershipTests(CineSeatApiFactory factory) => _factory = factory;

    /// <summary>Verilen üye adına, kendi kurduğu seansta rezervasyon oluşturur.</summary>
    private async Task<(long ReservationId, TestScenario Scenario)> CreateReservationAsync(HttpClient member)
    {
        var admin = await _factory.AuthenticateAsAdminAsync();
        var scenario = await TestScenarioBuilder.CreateShowtimeAsync(admin, _factory);

        var seatId = scenario.SeatIds[0];

        var response = await member.PostAsJsonAsync("/api/reservations", new
        {
            showtimeId = scenario.ShowtimeId,
            buyerFname = "Test",
            buyerLname = "Alici",
            buyerEmail = "alici@ornek.com",
            seats = new[] { new { seatId, ticketType = "Adult" } }
        });

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Rezervasyon kurulamadi ({(int)response.StatusCode}): " +
                await response.Content.ReadAsStringAsync());
        }

        var payload = await response.ReadJsonAsync();
        return (payload.GetProperty("id").GetInt64(), scenario);
    }

    [Fact]
    public async Task Sahibi_kendi_rezervasyonunu_okuyabilir()
    {
        var uye = await _factory.AuthenticateAsNewMemberAsync();
        var (reservationId, _) = await CreateReservationAsync(uye);

        var response = await uye.GetAsync($"/api/reservations/{reservationId}");

        response.EnsureSuccessStatusCode();
        var payload = await response.ReadJsonAsync();
        Assert.Equal(reservationId, payload.GetProperty("id").GetInt64());
    }

    [Fact]
    public async Task Baskasinin_rezervasyonu_404_doner()
    {
        var sahip = await _factory.AuthenticateAsNewMemberAsync();
        var (reservationId, _) = await CreateReservationAsync(sahip);

        var yabanci = await _factory.AuthenticateAsNewMemberAsync();
        var response = await yabanci.GetAsync($"/api/reservations/{reservationId}");

        // 403 degil 404: kaydin varligi bile sizdirilmiyor.
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Reservation_read_izni_olan_baskasinin_rezervasyonunu_okuyabilir()
    {
        var sahip = await _factory.AuthenticateAsNewMemberAsync();
        var (reservationId, _) = await CreateReservationAsync(sahip);

        var admin = await _factory.AuthenticateAsAdminAsync();
        var response = await admin.GetAsync($"/api/reservations/{reservationId}");

        response.EnsureSuccessStatusCode();
        var payload = await response.ReadJsonAsync();
        Assert.Equal(reservationId, payload.GetProperty("id").GetInt64());
    }

    [Fact]
    public async Task Yabanci_baskasinin_rezervasyonunu_iptal_edemez()
    {
        var sahip = await _factory.AuthenticateAsNewMemberAsync();
        var (reservationId, _) = await CreateReservationAsync(sahip);

        var yabanci = await _factory.AuthenticateAsNewMemberAsync();
        var iptal = await yabanci.PostAsync($"/api/reservations/{reservationId}/cancel", null);

        Assert.Equal(HttpStatusCode.NotFound, iptal.StatusCode);

        // Reddedilen istek kaydin durumunu degistirmemis olmali.
        var sonrasi = await sahip.GetAsync($"/api/reservations/{reservationId}");
        sonrasi.EnsureSuccessStatusCode();
        var durum = (await sonrasi.ReadJsonAsync()).GetProperty("status").GetString();

        Assert.NotEqual("Cancelled", durum);
    }

    [Fact]
    public async Task Sahibi_kendi_rezervasyonunu_iptal_edebilir()
    {
        var uye = await _factory.AuthenticateAsNewMemberAsync();
        var (reservationId, _) = await CreateReservationAsync(uye);

        var iptal = await uye.PostAsync($"/api/reservations/{reservationId}/cancel", null);
        iptal.EnsureSuccessStatusCode();

        var sonrasi = await uye.GetAsync($"/api/reservations/{reservationId}");
        sonrasi.EnsureSuccessStatusCode();

        Assert.Equal("Cancelled", (await sonrasi.ReadJsonAsync()).GetProperty("status").GetString());
    }

    [Fact]
    public async Task My_ucu_yalnizca_kendi_rezervasyonlarini_doner()
    {
        var birinci = await _factory.AuthenticateAsNewMemberAsync();
        var (birinciId, _) = await CreateReservationAsync(birinci);

        var ikinci = await _factory.AuthenticateAsNewMemberAsync();
        var (ikinciId, _) = await CreateReservationAsync(ikinci);

        var response = await ikinci.GetAsync("/api/reservations/my?pageSize=100");
        response.EnsureSuccessStatusCode();

        var payload = await response.ReadJsonAsync();
        var items = payload.ValueKind == JsonValueKind.Array ? payload : payload.GetProperty("items");
        var ids = items.EnumerateArray().Select(r => r.GetProperty("id").GetInt64()).ToList();

        Assert.Contains(ikinciId, ids);
        Assert.DoesNotContain(birinciId, ids);
    }

    [Fact]
    public async Task Tum_rezervasyon_listesi_reservation_read_istiyor()
    {
        var uye = await _factory.AuthenticateAsNewMemberAsync();
        var uyeCevabi = await uye.GetAsync("/api/reservations?pageSize=100");

        Assert.Equal(HttpStatusCode.Forbidden, uyeCevabi.StatusCode);

        var admin = await _factory.AuthenticateAsAdminAsync();
        var adminCevabi = await admin.GetAsync("/api/reservations?pageSize=100");

        adminCevabi.EnsureSuccessStatusCode();
    }
}
