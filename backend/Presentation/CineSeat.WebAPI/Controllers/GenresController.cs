using CineSeat.Application.Common.Constants;
using CineSeat.Application.Features.Genres.Commands.CreateGenre;
using CineSeat.Application.Features.Genres.Commands.DeleteGenre;
using CineSeat.Application.Features.Genres.Commands.UpdateGenre;
using CineSeat.Application.Features.Genres.DTOs;
using CineSeat.Application.Features.Genres.Queries.GetAllGenres;
using CineSeat.Application.Features.Genres.Queries.GetGenreById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenresController : ControllerBase
{
    private readonly IMediator _mediator;

    public GenresController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<GenreDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetAllGenresQuery(), cancellationToken));

    [HttpGet("{id:long}")]
    [ProducesResponseType(typeof(GenreDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetGenreByIdQuery { Id = id }, cancellationToken));

    [HttpPost]
    [Authorize(Policy = PermissionNames.GenreManage)]
    public async Task<IActionResult> Create(
        [FromBody] CreateGenreCommand command, CancellationToken cancellationToken)
    {
        var id = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:long}")]
    [Authorize(Policy = PermissionNames.GenreManage)]
    public async Task<IActionResult> Update(
        long id, [FromBody] UpdateGenreCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    [Authorize(Policy = PermissionNames.GenreManage)]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteGenreCommand { Id = id }, cancellationToken);
        return NoContent();
    }
}
