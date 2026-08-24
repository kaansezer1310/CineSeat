using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Showtimes.DTOs;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimeSeatMap;

public class GetShowtimeSeatMapQueryHandler
    : IRequestHandler<GetShowtimeSeatMapQuery, IReadOnlyList<ShowtimeSeatDto>>
{
    private readonly IShowtimeReadRepository _showtimeRead;
    private readonly ISeatReadRepository _seatRead;
    private readonly ISeatLockReadRepository _lockRead;
    private readonly ITicketReadRepository _ticketRead;
    private readonly IAsyncQueryExecutor _executor;
    private readonly ICurrentUserService _currentUser;

    public GetShowtimeSeatMapQueryHandler(
        IShowtimeReadRepository showtimeRead,
        ISeatReadRepository seatRead,
        ISeatLockReadRepository lockRead,
        ITicketReadRepository ticketRead,
        IAsyncQueryExecutor executor,
        ICurrentUserService currentUser)
    {
        _showtimeRead = showtimeRead;
        _seatRead = seatRead;
        _lockRead = lockRead;
        _ticketRead = ticketRead;
        _executor = executor;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<ShowtimeSeatDto>> Handle(
        GetShowtimeSeatMapQuery request, CancellationToken cancellationToken)
    {
        var showtime = await _showtimeRead.GetByIdAsync(
            request.ShowtimeId, tracking: false, cancellationToken);
        if (showtime is null)
            throw new NotFoundException("Seans", request.ShowtimeId);

        var seats = await _executor.ToListAsync(
            _seatRead.GetWhere(s => s.HallId == showtime.HallId, tracking: false)
                .OrderBy(s => s.SeatRow)
                .ThenBy(s => s.SeatColumn),
            cancellationToken);

        // Iptal edilmis rezervasyonun koltugu yeniden satilabilir olmali.
        var reservedSeatIds = await _executor.ToListAsync(
            _ticketRead.GetWhere(
                    t => t.Reservation.ShowtimeId == request.ShowtimeId
                         && t.Reservation.Status != ReservationStatus.Cancelled,
                    tracking: false)
                .Select(t => t.SeatId),
            cancellationToken);

        var now = DateTimeOffset.UtcNow;

        // Suresi dolmus kilit kimseyi engellemez.
        var activeLocks = await _executor.ToListAsync(
            _lockRead.GetWhere(
                    sl => sl.ShowtimeId == request.ShowtimeId && sl.LockExpiresAt > now,
                    tracking: false)
                .Select(sl => new { sl.SeatId, sl.UserId }),
            cancellationToken);

        var reserved = reservedSeatIds.ToHashSet();
        var lockOwnerBySeatId = activeLocks
            .GroupBy(item => item.SeatId)
            .ToDictionary(group => group.Key, group => group.First().UserId);

        var currentUserId = _currentUser.UserId;

        return seats
            .Select(seat =>
            {
                var hasLock = lockOwnerBySeatId.TryGetValue(seat.Id, out var lockOwnerId);

                // Rezervasyon kilitten baskindir: odemesi tamamlanmis koltuk,
                // uzerinde bayat bir kilit kalsa da satilamaz.
                var status = reserved.Contains(seat.Id)
                    ? ShowtimeSeatStatus.Reserved
                    : hasLock
                        ? ShowtimeSeatStatus.Locked
                        : ShowtimeSeatStatus.Available;

                return new ShowtimeSeatDto
                {
                    SeatId = seat.Id,
                    SeatRow = seat.SeatRow,
                    SeatColumn = seat.SeatColumn,
                    Type = seat.Type,
                    IsActive = seat.IsActive,
                    Status = status,
                    LockedByCurrentUser =
                        hasLock && currentUserId.HasValue && lockOwnerId == currentUserId.Value
                };
            })
            .ToList();
    }
}
