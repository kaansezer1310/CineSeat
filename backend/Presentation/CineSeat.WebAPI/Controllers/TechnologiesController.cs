using CineSeat.Application.Common.Constants;
using CineSeat.Application.Features.Technologies.Commands.CreateTechnology;
using CineSeat.Application.Features.Technologies.Commands.DeleteTechnology;
using CineSeat.Application.Features.Technologies.Commands.UpdateTechnology;
using CineSeat.Application.Features.Technologies.Queries.GetAllTechnologies;
using CineSeat.Application.Features.Technologies.Queries.GetTechnologyById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TechnologiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public TechnologiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllTechnologiesQuery()));

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
        => Ok(await _mediator.Send(new GetTechnologyByIdQuery { Id = id }));

    [Authorize(Roles = RoleNames.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTechnologyCommand command)
        => Ok(await _mediator.Send(command));

    [Authorize(Roles = RoleNames.Admin)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateTechnologyCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize(Roles = RoleNames.Admin)]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _mediator.Send(new DeleteTechnologyCommand { Id = id });
        return NoContent();
    }
}
