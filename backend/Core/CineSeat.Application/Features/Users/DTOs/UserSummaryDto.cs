namespace CineSeat.Application.Features.Users.DTOs;

/// <summary>
/// Yonetim listesindeki kullanici satiri.
/// PasswordHash/PasswordSalt BILINCLI OLARAK YOK.
/// </summary>
public class UserSummaryDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNum { get; set; }
    public long RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public DateTimeOffset MemberSince { get; set; }
    public int ReservationCount { get; set; }
}
