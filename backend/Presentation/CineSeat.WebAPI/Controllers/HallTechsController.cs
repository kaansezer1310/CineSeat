using CineSeat.Application.Common.Constants;
using CineSeat.Application.Features.HallTechs.Commands.AssignTechToHall;
using CineSeat.Application.Features.HallTechs.Commands.RemoveTechFromHall;
using CineSeat.Application.Features.HallTechs.Queries.GetTechsOfHall;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HallTechsController : ControllerBase
{
    private readonly IMediator _mediator;

    public HallTechsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetByHall([FromQuery] long hallId)
        => Ok(await _mediator.Send(new GetTechsOfHallQuery { HallId = hallId }));

    [Authorize(Roles = RoleNames.Admin)]
    [HttpPost]
    public async Task<IActionResult> Assign([FromBody] AssignTechToHallCommand command)
        => Ok(await _mediator.Send(command));

    [Authorize(Roles = RoleNames.Admin)]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Remove(long id)
    {
        await _mediator.Send(new RemoveTechFromHallCommand { Id = id });
        return NoContent();
    }
}
