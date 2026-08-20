using CineSeat.Application.Features.SeatLocks.Commands.LockSeat;
using CineSeat.Application.Features.SeatLocks.Commands.ReleaseSeat;
using CineSeat.Application.Features.SeatLocks.Queries.GetLockedSeatsByShowtime;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeatLocksController : ControllerBase
{
    private readonly IMediator _mediator;

    public SeatLocksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetByShowtime([FromQuery] long showtimeId)
        => Ok(await _mediator.Send(new GetLockedSeatsByShowtimeQuery { ShowtimeId = showtimeId }));

    [HttpPost]
    public async Task<IActionResult> Lock([FromBody] LockSeatCommand command)
        => Ok(await _mediator.Send(command));

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Release(long id)
    {
        await _mediator.Send(new ReleaseSeatCommand { Id = id });
        return NoContent();
    }
}
