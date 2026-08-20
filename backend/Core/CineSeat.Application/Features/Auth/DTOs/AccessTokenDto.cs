namespace CineSeat.Application.Features.Auth.DTOs;

/// <summary>
/// ITokenService'in ürettiği ham token bilgisi.
/// </summary>
public class AccessTokenDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
