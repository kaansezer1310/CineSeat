namespace CineSeat.Application.Features.Auth.DTOs;

/// <summary>
/// Register ve Login'in ortak dönüş tipi: token + kullanıcı.
/// </summary>
public class AuthResultDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public AuthUserDto User { get; set; } = new();
}
