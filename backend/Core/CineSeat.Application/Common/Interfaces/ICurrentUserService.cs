namespace CineSeat.Application.Common.Interfaces;

/// <summary>
/// İsteği yapan kullanıcıyı handler'lara taşır. Handler'lar HttpContext'i
/// tanımaz; "şu anki kullanıcı" bilgisini bu arayüzden alır.
/// Implementasyon: CineSeat.WebAPI.Services.CurrentUserService (IHttpContextAccessor)
/// </summary>
public interface ICurrentUserService
{
    long? UserId { get; }
    string? Username { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }

    /// <summary>
    /// Kimlik doğrulaması zorunlu handler'lar için: kullanıcı yoksa
    /// <see cref="Exceptions.UnauthorizedException"/> fırlatır, varsa id'yi döndürür.
    /// </summary>
    long GetRequiredUserId();
}
