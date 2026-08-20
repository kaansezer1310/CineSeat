using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.MovieGenres.Commands.AssignGenreToMovie;
using CineSeat.Application.Features.MovieGenres.Commands.RemoveGenreFromMovie;
using CineSeat.Application.Features.MovieGenres.Queries.GetGenresOfMovie;
using CineSeat.Application.Features.Movies.Commands.CreateMovie;
using CineSeat.Application.Features.Movies.Commands.DeleteMovie;
using CineSeat.Application.Features.Movies.Commands.UpdateMovie;
using CineSeat.Application.Features.Movies.DTOs;
using CineSeat.Application.Features.Movies.Queries.GetMovieById;
using CineSeat.Application.Features.Movies.Queries.GetMovies;
using CineSeat.Application.Features.Genres.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

/// <summary>
/// Controller'ın tek sorumluluğu: HTTP'yi Command/Query'ye çevirmek ve
/// sonucu HTTP durum koduna dönüştürmek.
///
/// Burada ne DbContext var, ne repository, ne iş kuralı, ne doğrulama.
/// Bir endpoint eklemek = bir Command/Query göndermek.
///
/// Okuma endpoint'leri herkese açık; yazma endpoint'leri Admin rolüne kapalı.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMediator _mediator;

    public MoviesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Filmleri arama ve sayfalama ile listeler.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<MovieDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] GetMoviesQuery query, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(query, cancellationToken));

    /// <summary>Tek film getirir.</summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(MovieDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetMovieByIdQuery { Id = id }, cancellationToken));

    /// <summary>Filmin türlerini listeler.</summary>
    [HttpGet("{id:long}/genres")]
    [ProducesResponseType(typeof(List<GenreDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGenres(long id, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetGenresOfMovieQuery { MovieId = id }, cancellationToken));

    /// <summary>Yeni film oluşturur.</summary>
    [HttpPost]
    [Authorize(Roles = RoleNames.Admin)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateMovieCommand command, CancellationToken cancellationToken)
    {
        var id = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:long}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateMovieCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteMovieCommand { Id = id }, cancellationToken);
        return NoContent();
    }

    /// <summary>Filme tür atar.</summary>
    [HttpPost("{id:long}/genres")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> AssignGenre(
        long id, [FromBody] AssignGenreToMovieCommand command, CancellationToken cancellationToken)
    {
        command.MovieId = id;
        return Ok(await _mediator.Send(command, cancellationToken));
    }

    /// <summary>Filmden tür atamasını kaldırır.</summary>
    [HttpDelete("{id:long}/genres/{genreId:long}")]
    [Authorize(Roles = RoleNames.Admin)]
    public async Task<IActionResult> RemoveGenre(long id, long genreId, CancellationToken cancellationToken)
    {
        await _mediator.Send(
            new RemoveGenreFromMovieCommand { MovieId = id, GenreId = genreId }, cancellationToken);
        return NoContent();
    }
}
