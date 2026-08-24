using CineSeat.Application.Common.Constants;
using CineSeat.Application.Features.Showtimes.Commands.CreateShowtime;
using CineSeat.Application.Features.Showtimes.Commands.DeleteShowtime;
using CineSeat.Application.Features.Showtimes.Commands.UpdateShowtime;
using CineSeat.Application.Features.Showtimes.Queries.GetShowtimeById;
using CineSeat.Application.Features.Showtimes.Queries.GetShowtimeSeatMap;
using CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByCinema;
using CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByMovie;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShowtimesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ShowtimesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("by-movie/{movieId:long}")]
    public async Task<IActionResult> GetByMovie(
        long movieId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        => Ok(await _mediator.Send(
            new GetShowtimesByMovieQuery { MovieId = movieId, PageNumber = pageNumber, PageSize = pageSize }));

    [HttpGet("by-cinema/{cinemaId:long}")]
    public async Task<IActionResult> GetByCinema(
        long cinemaId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        => Ok(await _mediator.Send(
            new GetShowtimesByCinemaQuery { CinemaId = cinemaId, PageNumber = pageNumber, PageSize = pageSize }));

    /// <summary>
    /// Seansın koltuk haritası: salonun koltukları + her koltuğun bu seanstaki
    /// durumu (boş / kilitli / rezerve). Koltuk planını çizmek için gerekli,
    /// bu yüzden anonim erişime açık — kilidin kime ait olduğu bilgisi ise
    /// yalnızca token varsa doldurulur.
    /// </summary>
    [HttpGet("{id:long}/seats")]
    public async Task<IActionResult> GetSeatMap(long id, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(
            new GetShowtimeSeatMapQuery { ShowtimeId = id }, cancellationToken));

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
        => Ok(await _mediator.Send(new GetShowtimeByIdQuery { Id = id }));

    [Authorize(Policy = PermissionNames.ShowtimeManage)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateShowtimeCommand command)
        => Ok(await _mediator.Send(command));

    [Authorize(Policy = PermissionNames.ShowtimeManage)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateShowtimeCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize(Policy = PermissionNames.ShowtimeManage)]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _mediator.Send(new DeleteShowtimeCommand { Id = id });
        return NoContent();
    }
}
