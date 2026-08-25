using System.Net;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Yetkilendirme katmanının sözleşmesi:
///   • kimliksiz istek           → 401 Unauthorized
///   • kimlikli ama izinsiz üye  → 403 Forbidden
///   • yetkili yönetici          → 401/403 DEĞİL
///
/// Yöneticide "200 bekle" demiyoruz bilerek: gövdesiz bir POST 400, olmayan
/// bir kayda PUT 404 döndürür. Burada ölçtüğümüz şey iş kuralı değil, isteğin
/// yetki duvarını geçip geçmediği.
/// </summary>
[Collection(TestCollection.Name)]
public class PermissionMatrixTests
{
    private readonly CineSeatApiFactory _factory;

    public PermissionMatrixTests(CineSeatApiFactory factory) => _factory = factory;

    /// <summary>Yönetim izni isteyen uçlar. Her satır: HTTP yöntemi + yol + beklenen izin.</summary>
    public static TheoryData<string, string, string> ProtectedEndpoints() => new()
    {
        { "GET",    "/api/movies/archived",  "movie.manage" },
        { "POST",   "/api/movies",           "movie.manage" },
        { "PUT",    "/api/movies/1",         "movie.manage" },
        { "DELETE", "/api/movies/1",         "movie.manage" },
        { "POST",   "/api/movies/1/restore", "movie.manage" },
        { "POST",   "/api/genres",           "genre.manage" },
        { "PUT",    "/api/genres/1",         "genre.manage" },
        { "DELETE", "/api/genres/1",         "genre.manage" },
        { "GET",    "/api/campaigns",        "campaign.manage" },
        { "POST",   "/api/campaigns",        "campaign.manage" },
        { "DELETE", "/api/campaigns/1",      "campaign.manage" },
        { "POST",   "/api/cities",           "cinema.manage" },
        { "POST",   "/api/districts",        "cinema.manage" },
        { "POST",   "/api/cinemas",          "cinema.manage" },
        { "POST",   "/api/halls",            "cinema.manage" },
        { "DELETE", "/api/halls/1",          "cinema.manage" },
        { "POST",   "/api/showtimes",        "showtime.manage" },
        { "DELETE", "/api/showtimes/1",      "showtime.manage" },
        { "GET",    "/api/reservations",     "reservation.read" },
        { "GET",    "/api/users",            "user.manage" },
        { "GET",    "/api/roles",            "user.manage" },
    };

    /// <summary>Yalnızca oturum isteyen, ayrıca izin istemeyen uçlar.</summary>
    public static TheoryData<string, string> AuthenticatedOnlyEndpoints() => new()
    {
        { "GET",  "/api/profile" },
        { "GET",  "/api/favorites" },
        { "GET",  "/api/reservations/my" },
        { "POST", "/api/seatlocks" },
        { "POST", "/api/seatlocks/renew" },
    };

    /// <summary>Herkese açık olması gereken uçlar.</summary>
    public static TheoryData<string> PublicEndpoints() =>
    [
        "/api/movies",
        "/api/cinemas",
        "/api/cities",
        "/api/districts",
        "/api/genres",
        "/api/campaigns/active",
    ];

    private static HttpRequestMessage Request(string method, string path) =>
        new(new HttpMethod(method), path)
        {
            // Gövde bekleyen uçlarda model bağlama hatası yerine yetki
            // sonucunu görebilmek için boş bir JSON nesnesi gönderiliyor.
            Content = method is "POST" or "PUT"
                ? new StringContent("{}", System.Text.Encoding.UTF8, "application/json")
                : null
        };

    [Theory]
    [MemberData(nameof(ProtectedEndpoints))]
    public async Task Kimliksiz_istek_401_alir(string method, string path, string permission)
    {
        _ = permission;

        var client = _factory.CreateClient();

        var response = await client.SendAsync(Request(method, path));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(ProtectedEndpoints))]
    public async Task Izinsiz_uye_403_alir(string method, string path, string permission)
    {
        // permission yalnizca test adinda hangi iznin olcuruldugunu gostermek icin var.
        _ = permission;

        var client = await _factory.AuthenticateAsNewMemberAsync();

        var response = await client.SendAsync(Request(method, path));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(ProtectedEndpoints))]
    public async Task Yonetici_yetki_duvarini_gecer(string method, string path, string permission)
    {
        _ = permission;

        var client = await _factory.AuthenticateAsAdminAsync();

        var response = await client.SendAsync(Request(method, path));

        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(AuthenticatedOnlyEndpoints))]
    public async Task Oturum_isteyen_uclar_kimliksiz_istekte_401_alir(string method, string path)
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(Request(method, path));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(AuthenticatedOnlyEndpoints))]
    public async Task Oturum_isteyen_uclar_sade_uyeye_403_vermez(string method, string path)
    {
        var client = await _factory.AuthenticateAsNewMemberAsync();

        var response = await client.SendAsync(Request(method, path));

        // Bu uçlar ayrıca izin istemiyor; üye reddedilmemeli.
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [MemberData(nameof(PublicEndpoints))]
    public async Task Acik_uclar_kimliksiz_erisilebilir(string path)
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync(path);

        Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
