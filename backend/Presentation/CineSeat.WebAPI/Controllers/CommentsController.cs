using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Comments.Commands.AddComment;
using CineSeat.Application.Features.Comments.Commands.DeleteComment;
using CineSeat.Application.Features.Comments.DTOs;
using CineSeat.Application.Features.Comments.Queries.GetCommentsByMovie;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CommentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Bir filmin yorumları — herkese açık.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<CommentDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByMovie(
        [FromQuery] long movieId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
        => Ok(await _mediator.Send(
            new GetCommentsByMovieQuery { MovieId = movieId, PageNumber = pageNumber, PageSize = pageSize },
            cancellationToken));

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Add(
        [FromBody] AddCommentCommand command, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(command, cancellationToken));

    /// <summary>
    /// Kendi yorumunu silme. Admin başkasının yorumunu da silebilir —
    /// bu ayrım handler içinde yapılıyor, iki ayrı endpoint gerekmiyor.
    /// </summary>
    [HttpDelete("{id:long}")]
    [Authorize]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteCommentCommand { Id = id }, cancellationToken);
        return NoContent();
    }
}
