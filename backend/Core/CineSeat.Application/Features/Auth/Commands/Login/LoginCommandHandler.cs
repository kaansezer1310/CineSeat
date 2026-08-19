using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Auth.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResultDto>
{
    private readonly IUserReadRepository _userRead;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public LoginCommandHandler(
        IUserReadRepository userRead,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IAsyncQueryExecutor queryExecutor)
    {
        _userRead = userRead;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _queryExecutor = queryExecutor;
    }

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var identifier = request.UsernameOrEmail.Trim().ToLower();

        // Rolü tek sorguda getirmek için projeksiyon kullanıyoruz; Include() bir
        // EF metodu ve Application katmanında kullanılamaz.
        var candidate = await _queryExecutor.FirstOrDefaultAsync(
            _userRead
                .GetWhere(u => u.Email.ToLower() == identifier || u.Username.ToLower() == identifier, tracking: false)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Surname,
                    u.Username,
                    u.Email,
                    u.PasswordHash,
                    u.PasswordSalt,
                    RoleName = u.Role.Name
                }),
            cancellationToken);

        // Kullanıcı yok ile parola yanlış AYNI mesajı döndürür: farklı mesaj
        // vermek saldırgana hangi e-postaların kayıtlı olduğunu sızdırır.
        if (candidate is null ||
            !_passwordHasher.Verify(request.Password, candidate.PasswordHash, candidate.PasswordSalt))
        {
            throw new UnauthorizedException("Kullanıcı adı/e-posta veya parola hatalı.");
        }

        var token = _tokenService.CreateAccessToken(
            candidate.Id, candidate.Username, candidate.Email, candidate.RoleName);

        return new AuthResultDto
        {
            Token = token.Token,
            ExpiresAt = token.ExpiresAt,
            User = new AuthUserDto
            {
                Id = candidate.Id,
                Name = candidate.Name,
                Surname = candidate.Surname,
                Username = candidate.Username,
                Email = candidate.Email,
                Role = candidate.RoleName
            }
        };
    }
}
