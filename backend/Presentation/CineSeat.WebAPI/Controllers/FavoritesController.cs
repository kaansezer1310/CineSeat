using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.UserFavorites.Commands.AddFavorite;
using CineSeat.Application.Features.UserFavorites.Commands.RemoveFavorite;
using CineSeat.Application.Features.UserFavorites.DTOs;
using CineSeat.Application.Features.UserFavorites.Queries.GetMyFavorites;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

/// <summary>
/// Tamamı giriş gerektirir — favori listesi kullanıcıya özeldir.
/// Hangi kullanıcı olduğu token'dan okunur, istekten DEĞİL.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IMediator _mediator;

    public FavoritesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<FavoriteMovieDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMy(
        [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
        => Ok(await _mediator.Send(
            new GetMyFavoritesQuery { PageNumber = pageNumber, PageSize = pageSize }, cancellationToken));

    [HttpPost]
    public async Task<IActionResult> Add(
        [FromBody] AddFavoriteCommand command, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(command, cancellationToken));

    [HttpDelete("{movieId:long}")]
    public async Task<IActionResult> Remove(long movieId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new RemoveFavoriteCommand { MovieId = movieId }, cancellationToken);
        return NoContent();
    }
}
