using System.Net;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Sayfalayan her uç, sayfa başına kaç kayıt verdiğine bir üst sınır koymalı.
/// Sınırsız bir `pageSize` tek istekte tablonun tamamını çektirir.
///
/// Bu testler yazıldığında dört uçta sınır yoktu: /movies, /comments,
/// /favorites ve /users `pageSize=999999` isteğini kabul ediyordu.
/// </summary>
[Collection(TestCollection.Name)]
public class PaginationLimitTests
{
    private const int Cap = 100;

    private readonly CineSeatApiFactory _factory;

    public PaginationLimitTests(CineSeatApiFactory factory) => _factory = factory;

    /// <summary>Kimlik istemeyen sayfalı uçlar.</summary>
    public static TheoryData<string> PublicPagedEndpoints() =>
    [
        "/api/movies?page=1&pageSize={0}",
        "/api/comments?movieId=1&pageNumber=1&pageSize={0}",
        "/api/cinemas?pageNumber=1&pageSize={0}",
        "/api/cities?pageNumber=1&pageSize={0}",
    ];

    /// <summary>Oturum ya da izin isteyen sayfalı uçlar.</summary>
    public static TheoryData<string> AuthenticatedPagedEndpoints() =>
    [
        "/api/favorites?pageNumber=1&pageSize={0}",
        "/api/users?pageNumber=1&pageSize={0}",
        "/api/reservations?pageNumber=1&pageSize={0}",
        "/api/movies/archived?pageNumber=1&pageSize={0}",
    ];

    [Theory]
    [MemberData(nameof(PublicPagedEndpoints))]
    public async Task Acik_uclar_asiri_sayfa_boyutunu_reddeder(string template)
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(string.Format(template, 999_999));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(PublicPagedEndpoints))]
    public async Task Acik_uclar_sinir_icindeki_boyutu_kabul_eder(string template)
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(string.Format(template, Cap));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(AuthenticatedPagedEndpoints))]
    public async Task Korumali_uclar_asiri_sayfa_boyutunu_reddeder(string template)
    {
        var client = await _factory.AuthenticateAsAdminAsync();

        var response = await client.GetAsync(string.Format(template, 999_999));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(AuthenticatedPagedEndpoints))]
    public async Task Korumali_uclar_sinir_icindeki_boyutu_kabul_eder(string template)
    {
        var client = await _factory.AuthenticateAsAdminAsync();

        var response = await client.GetAsync(string.Format(template, Cap));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Sifir_ve_negatif_sayfa_boyutu_reddedilir()
    {
        var client = _factory.CreateClient();

        foreach (var size in new[] { 0, -1 })
        {
            var response = await client.GetAsync($"/api/movies?page=1&pageSize={size}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
