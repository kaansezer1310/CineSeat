using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Movies.Commands.CreateMovie;
using CineSeat.Application.Features.Movies.DTOs;
using CineSeat.Application.Features.Movies.Queries.GetMovies;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

/// <summary>
/// Controller'ın tek sorumluluğu: HTTP'yi Command/Query'ye çevirmek ve
/// sonucu HTTP durum koduna dönüştürmek.
///
/// Burada ne DbContext var, ne repository, ne iş kuralı, ne doğrulama.
/// Bir endpoint eklemek = bir Command/Query göndermek.
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
    {
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result.Value);
    }

    /// <summary>
    /// Tek film getirir. Şu an GetMovies sorgusunu id ile filtreleyerek çalışır;
    /// gerçek projede kendi GetMovieByIdQuery'si olur — sunum kapsamında
    /// bilinçli olarak yazılmadı.
    /// </summary>
    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(MovieDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetMoviesQuery { Page = 1, PageSize = 100 }, cancellationToken);
        var movie = result.Value?.Items.FirstOrDefault(m => m.Id == id);

        return movie is null ? NotFound() : Ok(movie);
    }

    /// <summary>Yeni film oluşturur.</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateMovieCommand command, CancellationToken cancellationToken)
    {
        Result<long> result = await _mediator.Send(command, cancellationToken);

        if (!result.IsSuccess)
        {
            return Conflict(new { error = result.Error });
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value }, new { id = result.Value });
    }
}
