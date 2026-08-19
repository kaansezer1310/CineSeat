using CineSeat.Application.Features.Tickets.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Tickets.Queries.GetTicketsByReservation;

public class GetTicketsByReservationQuery : IRequest<List<TicketDto>>
{
    public long ReservationId { get; set; }
}
