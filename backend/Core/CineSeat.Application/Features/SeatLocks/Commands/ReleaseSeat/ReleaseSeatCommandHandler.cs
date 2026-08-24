using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.ReleaseSeat;

public class ReleaseSeatCommandHandler : IRequestHandler<ReleaseSeatCommand, Unit>
{
    private readonly ISeatLockReadRepository _read;
    private readonly ISeatLockWriteRepository _write;
    private readonly ICurrentUserService _currentUser;

    public ReleaseSeatCommandHandler(
        ISeatLockReadRepository read,
        ISeatLockWriteRepository write,
        ICurrentUserService currentUser)
    {
        _read = read;
        _write = write;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(ReleaseSeatCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();
        var canManageShowtimes = _currentUser.HasPermission(PermissionNames.ShowtimeManage);

        var seatLock = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);

        // Sahiplik kontrolü ŞART: id ile silinebilseydi herkes başkasının koltuk
        // kilidini açıp o koltuğu kapabilirdi. Başkasının kilidinin varlığını
        // sızdırmamak için yetkisiz erişim de NotFound olarak döner.
        if (seatLock is null || (seatLock.UserId != userId && !canManageShowtimes))
            throw new NotFoundException("Koltuk kilidi", request.Id);

        _write.HardDelete(seatLock);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
