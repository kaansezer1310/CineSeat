using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace CineSeat.IntegrationTests;

/// <summary>
/// Testlerin tekrar tekrar yazmak zorunda kalmaması için oturum açma ve
/// JSON okuma yardımcıları.
/// </summary>
public static class ApiClientExtensions
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    public const string AdminUsername = "admin";
    public const string AdminPassword = "Admin123!";

    /// <summary>Yönetici olarak giriş yapıp Authorization başlığı kurulmuş bir istemci verir.</summary>
    public static async Task<HttpClient> AuthenticateAsAdminAsync(this CineSeatApiFactory factory)
    {
        var client = factory.CreateClient();
        await client.LoginAsync(AdminUsername, AdminPassword);
        return client;
    }

    // Kullanıcı adı sunucuda en fazla 30 karakter ve yalnızca [a-zA-Z0-9_.]
    // kabul ediyor. Testler için kısa ve çakışmayan ad üretmek üzere sayac kullanılıyor.
    private static int _memberCounter;

    /// <summary>
    /// Yeni bir üye kaydeder ve o üye adına oturum açmış istemci verir.
    /// Üye rolünde hiçbir yönetim izni yoktur.
    /// </summary>
    public static async Task<HttpClient> AuthenticateAsNewMemberAsync(this CineSeatApiFactory factory)
    {
        var client = factory.CreateClient();
        var suffix = Interlocked.Increment(ref _memberCounter);

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            name = "Test",
            surname = "Uye",
            username = $"uye_{suffix}",
            email = $"uye_{suffix}@ornek.com",
            password = "Uye12345!"
        });

        response.EnsureSuccessStatusCode();
        client.UseTokenFrom(await response.ReadJsonAsync());

        return client;
    }

    public static async Task LoginAsync(this HttpClient client, string usernameOrEmail, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            usernameOrEmail,
            password
        });

        response.EnsureSuccessStatusCode();
        client.UseTokenFrom(await response.ReadJsonAsync());
    }

    private static void UseTokenFrom(this HttpClient client, JsonElement payload)
    {
        var token = payload.GetProperty("token").GetString();

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    /// <summary>Cevabı JsonElement olarak okur; DTO tiplerini test projesine taşımadan alan okunabilsin diye.</summary>
    public static async Task<JsonElement> ReadJsonAsync(this HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<JsonElement>(body, JsonOptions);
    }
}
