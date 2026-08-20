using CineSeat.Application.Features.Tickets.Queries.GetTicketById;
using CineSeat.Application.Features.Tickets.Queries.GetTicketsByReservation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TicketsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
        => Ok(await _mediator.Send(new GetTicketByIdQuery { Id = id }));

    [HttpGet("by-reservation/{reservationId:long}")]
    public async Task<IActionResult> GetByReservation(long reservationId)
        => Ok(await _mediator.Send(new GetTicketsByReservationQuery { ReservationId = reservationId }));
}
