using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Users.Commands.ChangeUserRole;

public class ChangeUserRoleCommandHandler
    : IRequestHandler<ChangeUserRoleCommand, Unit>
{
    private readonly IUserReadRepository _userRead;
    private readonly IUserWriteRepository _userWrite;
    private readonly IRoleReadRepository _roleRead;
    private readonly ICurrentUserService _currentUser;

    public ChangeUserRoleCommandHandler(
        IUserReadRepository userRead,
        IUserWriteRepository userWrite,
        IRoleReadRepository roleRead,
        ICurrentUserService currentUser)
    {
        _userRead = userRead;
        _userWrite = userWrite;
        _roleRead = roleRead;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(
        ChangeUserRoleCommand request, CancellationToken cancellationToken)
    {
        // Kendi rolunu dusurmek, sistemde hic yoneticinin kalmamasina yol
        // acabilir; en azindan yoneticinin kendini kilitlemesini engelliyoruz.
        if (_currentUser.UserId == request.UserId)
            throw new ConflictException("Kendi rolunuzu degistiremezsiniz.");

        var user = await _userRead.GetByIdAsync(request.UserId, tracking: true, cancellationToken);
        if (user is null)
            throw new NotFoundException("Kullanici", request.UserId);

        var role = await _roleRead.GetByIdAsync(request.RoleId, tracking: false, cancellationToken);
        if (role is null)
            throw new NotFoundException("Rol", request.RoleId);

        user.RoleId = role.Id;

        _userWrite.Update(user);
        await _userWrite.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
