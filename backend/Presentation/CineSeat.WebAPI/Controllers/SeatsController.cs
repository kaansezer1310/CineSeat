using CineSeat.Application.Features.Seats.Commands.CreateSeats;
using CineSeat.Application.Features.Seats.Commands.DeleteSeat;
using CineSeat.Application.Features.Seats.Commands.UpdateSeat;
using CineSeat.Application.Features.Seats.Queries.GetSeatMap;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeatsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SeatsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("map")]
    public async Task<IActionResult> GetSeatMap([FromQuery] long hallId)
        => Ok(await _mediator.Send(new GetSeatMapQuery { HallId = hallId }));

    [HttpPost("bulk")]
    public async Task<IActionResult> CreateSeats([FromBody] CreateSeatsCommand command)
        => Ok(await _mediator.Send(command));

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateSeatCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _mediator.Send(new DeleteSeatCommand { Id = id });
        return NoContent();
    }
}
