using CineSeat.Application.Common.Constants;
using CineSeat.Application.Features.Halls.Commands.CreateHall;
using CineSeat.Application.Features.Halls.Commands.DeleteHall;
using CineSeat.Application.Features.Halls.Commands.UpdateHall;
using CineSeat.Application.Features.Halls.Queries.GetHallById;
using CineSeat.Application.Features.Halls.Queries.GetHallsByCinema;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HallsController : ControllerBase
{
    private readonly IMediator _mediator;

    public HallsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetByCinema([FromQuery] long cinemaId)
        => Ok(await _mediator.Send(new GetHallsByCinemaQuery { CinemaId = cinemaId }));

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
        => Ok(await _mediator.Send(new GetHallByIdQuery { Id = id }));

    [Authorize(Roles = RoleNames.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHallCommand command)
        => Ok(await _mediator.Send(command));

    [Authorize(Roles = RoleNames.Admin)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateHallCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize(Roles = RoleNames.Admin)]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _mediator.Send(new DeleteHallCommand { Id = id });
        return NoContent();
    }
}
