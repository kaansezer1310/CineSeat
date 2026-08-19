using CineSeat.Application.Features.Users.Commands.UpdateProfile;
using CineSeat.Application.Features.Users.DTOs;
using CineSeat.Application.Features.Users.Queries.GetProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProfileController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetProfileQuery(), cancellationToken));

    [HttpPut]
    public async Task<IActionResult> Update(
        [FromBody] UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }
}
