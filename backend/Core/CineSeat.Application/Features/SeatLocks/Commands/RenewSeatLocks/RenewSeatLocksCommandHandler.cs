using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.SeatLocks.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.RenewSeatLocks;

public class RenewSeatLocksCommandHandler
    : IRequestHandler<RenewSeatLocksCommand, IReadOnlyList<SeatLockDto>>
{
    private readonly ISeatLockReadRepository _lockRead;
    private readonly ISeatLockWriteRepository _lockWrite;
    private readonly IAsyncQueryExecutor _executor;
    private readonly ICurrentUserService _currentUser;

    public RenewSeatLocksCommandHandler(
        ISeatLockReadRepository lockRead,
        ISeatLockWriteRepository lockWrite,
        IAsyncQueryExecutor executor,
        ICurrentUserService currentUser)
    {
        _lockRead = lockRead;
        _lockWrite = lockWrite;
        _executor = executor;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<SeatLockDto>> Handle(
        RenewSeatLocksCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();
        var now = DateTimeOffset.UtcNow;

        var seatIds = request.SeatIds.Distinct().ToList();

        // Yalnizca CAGIRAN kullaniciya ait kilitler getirilir; baskasinin
        // kilidini uzatmak mumkun olmamali.
        var locks = await _executor.ToListAsync(
            _lockRead.GetWhere(
                sl => sl.ShowtimeId == request.ShowtimeId
                      && sl.UserId == userId
                      && seatIds.Contains(sl.SeatId),
                tracking: true),
            cancellationToken);

        // Suresi dolmus bir kilit bu arada baskasi tarafindan devralinmis
        // olabilir. Sessizce uzatmak, kullaniciya "koltugun hala senin"
        // demek olurdu; bu yuzden yenileme tumden reddedilir.
        var expired = locks.Where(sl => sl.LockExpiresAt < now).ToList();
        if (expired.Count > 0)
            throw new ConflictException(
                "Bazi koltuklarin kilit suresi dolmus. Koltuk secimini yenileyin.");

        var missing = seatIds.Except(locks.Select(sl => sl.SeatId)).ToList();
        if (missing.Count > 0)
            throw new ConflictException(
                "Bazi koltuklar artik size ait degil. Koltuk secimini yenileyin.");

        var newExpiry = now.AddMinutes(request.LockMinutes);
        foreach (var seatLock in locks)
        {
            seatLock.LockExpiresAt = newExpiry;
            _lockWrite.Update(seatLock);
        }

        await _lockWrite.SaveAsync(cancellationToken);

        return locks
            .Select(sl => new SeatLockDto
            {
                Id = sl.Id,
                ShowtimeId = sl.ShowtimeId,
                SeatId = sl.SeatId,
                LockExpiresAt = sl.LockExpiresAt
            })
            .ToList();
    }
}
