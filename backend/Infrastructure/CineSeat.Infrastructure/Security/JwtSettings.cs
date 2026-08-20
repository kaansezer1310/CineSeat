namespace CineSeat.Infrastructure.Security;

/// <summary>
/// appsettings.json → "Jwt" bölümüne karşılık gelir.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;

    /// <summary>HMAC-SHA256 imza anahtarı. En az 32 karakter olmalıdır.</summary>
    public string Key { get; set; } = string.Empty;

    public int ExpiryMinutes { get; set; } = 120;
}
