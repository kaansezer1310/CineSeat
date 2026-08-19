namespace CineSeat.Application.Features.Users.DTOs;

/// <summary>
/// Kullanıcının kendi profili. PasswordHash/PasswordSalt asla dışarı çıkmaz.
/// </summary>
public class UserProfileDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNum { get; set; }
    public string? Gender { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTimeOffset MemberSince { get; set; }
}
