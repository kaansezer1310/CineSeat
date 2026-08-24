using CineSeat.Application.Features.SeatLocks.Commands.LockSeat;
using CineSeat.Application.Features.SeatLocks.Commands.ReleaseSeat;
using CineSeat.Application.Features.SeatLocks.Commands.RenewSeatLocks;
using CineSeat.Application.Features.SeatLocks.DTOs;
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

    /// <summary>
    /// Koltuğu kilitler; aynı kullanıcı aynı isteği yinelerse kilit süresini yeniler.
    /// Kilidi alan kullanıcı token'dan okunur.
    /// </summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(SeatLockDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Lock(
        [FromBody] LockSeatCommand command,
        CancellationToken cancellationToken)
        => Ok(await _mediator.Send(command, cancellationToken));

    /// <summary>
    /// Seçimin tamamının kilit süresini tek istekte uzatır. Ödeme ekranındaki
    /// geri sayım bitmeden çağrılır; koltuk başına ayrı istek gerekmez.
    /// </summary>
    [HttpPost("renew")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<SeatLockDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Renew(
        [FromBody] RenewSeatLocksCommand command,
        CancellationToken cancellationToken)
        => Ok(await _mediator.Send(command, cancellationToken));

    /// <summary>
    /// Kilidi bırakır. Yalnızca kilidin sahibi veya showtime.manage izni olan
    /// kullanıcı bırakabilir.
    /// </summary>
    [HttpDelete("{id:long}")]
    [Authorize]
    public async Task<IActionResult> Release(long id)
    {
        await _mediator.Send(new ReleaseSeatCommand { Id = id });
        return NoContent();
    }
}
