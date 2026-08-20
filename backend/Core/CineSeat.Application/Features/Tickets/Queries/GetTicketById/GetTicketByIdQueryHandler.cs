using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Tickets.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Tickets.Queries.GetTicketById;

public class GetTicketByIdQueryHandler : IRequestHandler<GetTicketByIdQuery, TicketDto>
{
    private readonly ITicketReadRepository _read;

    public GetTicketByIdQueryHandler(ITicketReadRepository read) => _read = read;

    public async Task<TicketDto> Handle(GetTicketByIdQuery request, CancellationToken cancellationToken)
    {
        var ticket = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (ticket is null)
            throw new NotFoundException("Bilet", request.Id);

        return new TicketDto
        {
            Id = ticket.Id,
            ReservationId = ticket.ReservationId,
            SeatId = ticket.SeatId,
            TicketType = ticket.TicketType,
            Price = ticket.Price
        };
    }
}
