using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Tickets.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Tickets.Queries.GetTicketsByReservation;

public class GetTicketsByReservationQueryHandler
    : IRequestHandler<GetTicketsByReservationQuery, List<TicketDto>>
{
    private readonly ITicketReadRepository _read;
    private readonly IReservationReadRepository _reservationRead;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _executor;

    public GetTicketsByReservationQueryHandler(
        ITicketReadRepository read,
        IReservationReadRepository reservationRead,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor executor)
    {
        _read = read;
        _reservationRead = reservationRead;
        _currentUser = currentUser;
        _executor = executor;
    }

    public async Task<List<TicketDto>> Handle(
        GetTicketsByReservationQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();
        var isAdmin = _currentUser.Role == RoleNames.Admin;

        // Biletleri döndürmeden önce rezervasyonun sahibi olduğumuzu doğrula —
        // aksi halde id deneyerek başkasının biletleri okunabilirdi.
        var reservation = await _reservationRead.GetByIdAsync(
            request.ReservationId, tracking: false, cancellationToken);

        if (reservation is null || (reservation.UserId != userId && !isAdmin))
            throw new NotFoundException("Rezervasyon", request.ReservationId);

        var query = _read.GetWhere(t => t.ReservationId == request.ReservationId, tracking: false)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                ReservationId = t.ReservationId,
                SeatId = t.SeatId,
                TicketType = t.TicketType,
                Price = t.Price
            });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
