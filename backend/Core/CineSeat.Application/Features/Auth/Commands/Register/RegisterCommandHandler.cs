using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Auth.DTOs;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResultDto>
{
    private readonly IUserReadRepository _userRead;
    private readonly IUserWriteRepository _userWrite;
    private readonly IRoleReadRepository _roleRead;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public RegisterCommandHandler(
        IUserReadRepository userRead,
        IUserWriteRepository userWrite,
        IRoleReadRepository roleRead,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IAsyncQueryExecutor queryExecutor)
    {
        _userRead = userRead;
        _userWrite = userWrite;
        _roleRead = roleRead;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _queryExecutor = queryExecutor;
    }

    public async Task<AuthResultDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLower();
        var username = request.Username.Trim();

        // DB'de unique index de var (ApplicationDbContext), ama oraya düşmeden
        // anlamlı bir 409 dönmek için önce burada kontrol ediyoruz.
        var emailTaken = await _queryExecutor.AnyAsync(
            _userRead.GetWhere(u => u.Email.ToLower() == email, tracking: false), cancellationToken);
        if (emailTaken)
            throw new ConflictException("Bu e-posta adresi zaten kayıtlı.");

        var usernameTaken = await _queryExecutor.AnyAsync(
            _userRead.GetWhere(u => u.Username.ToLower() == username.ToLower(), tracking: false), cancellationToken);
        if (usernameTaken)
            throw new ConflictException("Bu kullanıcı adı zaten alınmış.");

        var role = await _queryExecutor.FirstOrDefaultAsync(
            _roleRead.GetWhere(r => r.Name == RoleNames.User, tracking: false), cancellationToken);
        if (role is null)
            throw new NotFoundException("Rol", RoleNames.User);

        var (hash, salt) = _passwordHasher.Hash(request.Password);

        var user = new User
        {
            Name = request.Name.Trim(),
            Surname = request.Surname.Trim(),
            Username = username,
            Email = email,
            PasswordHash = hash,
            PasswordSalt = salt,
            PhoneNum = request.PhoneNum,
            Gender = request.Gender,
            RoleId = role.Id
        };

        await _userWrite.AddAsync(user, cancellationToken);
        await _userWrite.SaveAsync(cancellationToken);

        var token = _tokenService.CreateAccessToken(user.Id, user.Username, user.Email, role.Name);

        return new AuthResultDto
        {
            Token = token.Token,
            ExpiresAt = token.ExpiresAt,
            User = new AuthUserDto
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Username = user.Username,
                Email = user.Email,
                Role = role.Name
            }
        };
    }
}
