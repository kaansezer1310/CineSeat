using CineSeat.Application.Features.Auth.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Auth.Commands.Register;

/// <summary>
/// Yeni kullanıcı kaydı. Rol istemciden ALINMAZ — herkes "User" rolüyle başlar,
/// aksi halde isteyen kendini Admin yapardı.
/// </summary>
public class RegisterCommand : IRequest<AuthResultDto>
{
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNum { get; set; }
    public string? Gender { get; set; }
}
