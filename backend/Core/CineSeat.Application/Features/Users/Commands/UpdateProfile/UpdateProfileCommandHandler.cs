using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Users.Commands.UpdateProfile;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Unit>
{
    private readonly IUserReadRepository _read;
    private readonly IUserWriteRepository _write;
    private readonly ICurrentUserService _currentUser;

    public UpdateProfileCommandHandler(
        IUserReadRepository read, IUserWriteRepository write, ICurrentUserService currentUser)
    {
        _read = read;
        _write = write;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();

        var user = await _read.GetByIdAsync(userId, tracking: true, cancellationToken);
        if (user is null)
            throw new NotFoundException("Kullanıcı", userId);

        user.Name = request.Name.Trim();
        user.Surname = request.Surname.Trim();
        user.PhoneNum = request.PhoneNum;
        user.Gender = request.Gender;

        _write.Update(user);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
