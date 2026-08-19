using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Tickets.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Tickets.Queries.GetTicketsByReservation;

public class GetTicketsByReservationQueryHandler
    : IRequestHandler<GetTicketsByReservationQuery, List<TicketDto>>
{
    private readonly ITicketReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetTicketsByReservationQueryHandler(ITicketReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<TicketDto>> Handle(
        GetTicketsByReservationQuery request, CancellationToken cancellationToken)
    {
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
