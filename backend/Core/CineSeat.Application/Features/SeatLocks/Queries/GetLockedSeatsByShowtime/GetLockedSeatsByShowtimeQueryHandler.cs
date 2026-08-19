using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.SeatLocks.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Queries.GetLockedSeatsByShowtime;

public class GetLockedSeatsByShowtimeQueryHandler
    : IRequestHandler<GetLockedSeatsByShowtimeQuery, List<SeatLockDto>>
{
    private readonly ISeatLockReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetLockedSeatsByShowtimeQueryHandler(ISeatLockReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<SeatLockDto>> Handle(
        GetLockedSeatsByShowtimeQuery request, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        // Süresi dolmuş kilitler artık geçerli sayılmaz — listede gösterilmez.
        var query = _read.GetWhere(
                sl => sl.ShowtimeId == request.ShowtimeId && sl.LockExpiresAt > now,
                tracking: false)
            .Select(sl => new SeatLockDto
            {
                Id = sl.Id,
                ShowtimeId = sl.ShowtimeId,
                SeatId = sl.SeatId,
                UserId = sl.UserId,
                LockExpiresAt = sl.LockExpiresAt
            });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
