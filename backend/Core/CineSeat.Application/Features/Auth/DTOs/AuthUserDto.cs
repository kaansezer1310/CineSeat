namespace CineSeat.Application.Features.Auth.DTOs;

/// <summary>
/// Giriş/kayıt sonrası istemciye dönen kullanıcı özeti.
/// PasswordHash/PasswordSalt BİLİNÇLİ OLARAK YOK.
/// </summary>
public class AuthUserDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public IReadOnlyList<string> Permissions { get; set; } = Array.Empty<string>();
}
