using CineSeat.Application.Common.Constants;
using CineSeat.Application.Features.Cinemas.Commands.CreateCinema;
using CineSeat.Application.Features.Cinemas.Commands.DeleteCinema;
using CineSeat.Application.Features.Cinemas.Commands.UpdateCinema;
using CineSeat.Application.Features.Cinemas.Queries.GetCinemaById;
using CineSeat.Application.Features.Cinemas.Queries.GetCinemasByCity;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CinemasController : ControllerBase
{
    private readonly IMediator _mediator;

    public CinemasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetByCity(
        [FromQuery] long cityId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        => Ok(await _mediator.Send(
            new GetCinemasByCityQuery { CityId = cityId, PageNumber = pageNumber, PageSize = pageSize }));

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
        => Ok(await _mediator.Send(new GetCinemaByIdQuery { Id = id }));

    [Authorize(Roles = RoleNames.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCinemaCommand command)
        => Ok(await _mediator.Send(command));

    [Authorize(Roles = RoleNames.Admin)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateCinemaCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize(Roles = RoleNames.Admin)]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _mediator.Send(new DeleteCinemaCommand { Id = id });
        return NoContent();
    }
}
