using CineSeat.Application.Features.Auth.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Auth.Commands.Login;

/// <summary>
/// Kullanıcı adı VEYA e-posta ile giriş.
/// </summary>
public class LoginCommand : IRequest<AuthResultDto>
{
    public string UsernameOrEmail { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
