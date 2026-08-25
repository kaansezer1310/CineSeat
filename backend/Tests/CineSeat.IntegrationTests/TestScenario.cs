using System.Net.Http.Json;
using System.Text.Json;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Bir seansın test edilebilmesi için gereken zincirin tamamı:
/// şehir → ilçe → sinema → salon → koltuklar → film → seans.
///
/// Demo seed'i "Testing" ortamında çalışmadığı için testler ihtiyaç duyduğu
/// kaydı kendisi kuruyor. Böylece seed içeriği değiştiğinde testler kırılmıyor.
/// </summary>
public sealed record TestScenario(
    long CityId,
    long DistrictId,
    long CinemaId,
    long HallId,
    long MovieId,
    long ShowtimeId,
    IReadOnlyList<long> SeatIds);

public static class TestScenarioBuilder
{
    private static int _counter;

    /// <summary>
    /// Yönetici istemcisiyle uçtan uca bir seans kurar. Her çağrı kendi
    /// kayıtlarını üretir; testler birbirinin koltuğunu kilitlemez.
    /// </summary>
    public static async Task<TestScenario> CreateShowtimeAsync(
        HttpClient adminClient,
        CineSeatApiFactory factory,
        short rowCount = 2,
        short columnCount = 3,
        DateTimeOffset? startsAt = null,
        short movieDurationMinutes = 100)
    {
        var tag = Interlocked.Increment(ref _counter);

        var cityId = await CreateAsync(adminClient, "/api/cities", new { cityName = $"TestSehir{tag}" });

        var districtId = await CreateAsync(adminClient, "/api/districts", new
        {
            districtName = $"TestIlce{tag}",
            cityId
        });

        var cinemaId = await CreateAsync(adminClient, "/api/cinemas", new
        {
            name = $"TestSinema{tag}",
            address = "Test Cd. 1",
            latitude = 41.0m,
            longitude = 29.0m,
            districtId
        });

        var hallId = await CreateAsync(adminClient, "/api/halls", new
        {
            name = $"Salon{tag}",
            cinemaId
        });

        var seatResponse = await adminClient.PostAsJsonAsync("/api/seats/bulk", new
        {
            hallId,
            rowCount,
            columnCount,
            defaultType = "Regular"
        });
        seatResponse.EnsureSuccessStatusCode();

        var movieId = await CreateAsync(adminClient, "/api/movies", new
        {
            title = $"Test Filmi {tag}",
            duration = movieDurationMinutes,
            description = "Entegrasyon testi icin olusturuldu.",
            ageLimit = (short)0,
            language = "Turkce",
            poster = "/posters/test.svg",
            startDate = DateTime.UtcNow.AddDays(-1),
            endDate = DateTime.UtcNow.AddDays(60)
        });

        var showtimeId = await CreateAsync(adminClient, "/api/showtimes", new
        {
            movieId,
            hallId,
            startDatetime = startsAt ?? DateTimeOffset.UtcNow.AddDays(3),
            basePrice = 150m,
            format = "Standard2D"
        });

        var seatIds = await ReadSeatIdsAsync(adminClient, hallId);

        return new TestScenario(cityId, districtId, cinemaId, hallId, movieId, showtimeId, seatIds);
    }

    /// <summary>POST edip dönen kimliği okur. Uçlar ya düz sayı ya da {id} döndürüyor.</summary>
    private static async Task<long> CreateAsync(HttpClient client, string path, object body)
    {
        var response = await client.PostAsJsonAsync(path, body);

        if (!response.IsSuccessStatusCode)
        {
            var problem = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"{path} kurulumu basarisiz ({(int)response.StatusCode}): {problem}");
        }

        var payload = await response.ReadJsonAsync();

        return payload.ValueKind == JsonValueKind.Number
            ? payload.GetInt64()
            : payload.GetProperty("id").GetInt64();
    }

    private static async Task<IReadOnlyList<long>> ReadSeatIdsAsync(HttpClient client, long hallId)
    {
        var response = await client.GetAsync($"/api/seats/map?hallId={hallId}");
        response.EnsureSuccessStatusCode();

        var payload = await response.ReadJsonAsync();
        var items = payload.ValueKind == JsonValueKind.Array
            ? payload
            : payload.GetProperty("items");

        return [.. items.EnumerateArray().Select(seat => seat.GetProperty("id").GetInt64())];
    }
}
