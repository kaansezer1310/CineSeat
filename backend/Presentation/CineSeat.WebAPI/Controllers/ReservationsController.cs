using CineSeat.Application.Features.Reservations.Commands.CancelReservation;
using CineSeat.Application.Features.Reservations.Commands.CreateReservation;
using CineSeat.Application.Features.Reservations.Queries.GetMyReservations;
using CineSeat.Application.Features.Reservations.Queries.GetReservationById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReservationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMy(
        [FromQuery] long userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        => Ok(await _mediator.Send(
            new GetMyReservationsQuery { UserId = userId, PageNumber = pageNumber, PageSize = pageSize }));

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
        => Ok(await _mediator.Send(new GetReservationByIdQuery { Id = id }));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReservationCommand command)
        => Ok(await _mediator.Send(command));

    [HttpPost("{id:long}/cancel")]
    public async Task<IActionResult> Cancel(long id, [FromQuery] long userId)
    {
        await _mediator.Send(new CancelReservationCommand { Id = id, UserId = userId });
        return NoContent();
    }
}
