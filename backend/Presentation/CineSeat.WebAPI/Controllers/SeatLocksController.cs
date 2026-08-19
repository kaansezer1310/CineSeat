using CineSeat.Application.Features.SeatLocks.Commands.LockSeat;
using CineSeat.Application.Features.SeatLocks.Commands.ReleaseSeat;
using CineSeat.Application.Features.SeatLocks.Queries.GetLockedSeatsByShowtime;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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

    /// <summary>
    /// Seansın kilitli koltukları — koltuk haritasını çizmek için gerekli,
    /// bu yüzden anonim erişime açık.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetByShowtime([FromQuery] long showtimeId)
        => Ok(await _mediator.Send(new GetLockedSeatsByShowtimeQuery { ShowtimeId = showtimeId }));

    /// <summary>Koltuk kilitler. Kilidi alan kullanıcı token'dan okunur.</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Lock([FromBody] LockSeatCommand command)
        => Ok(await _mediator.Send(command));

    /// <summary>Kilidi bırakır. Yalnızca kilidin sahibi (veya Admin) bırakabilir.</summary>
    [HttpDelete("{id:long}")]
    [Authorize]
    public async Task<IActionResult> Release(long id)
    {
        await _mediator.Send(new ReleaseSeatCommand { Id = id });
        return NoContent();
    }
}
