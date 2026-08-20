using CineSeat.Application.Features.Tickets.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Tickets.Queries.GetTicketById;

public class GetTicketByIdQuery : IRequest<TicketDto>
{
    public long Id { get; set; }
}
