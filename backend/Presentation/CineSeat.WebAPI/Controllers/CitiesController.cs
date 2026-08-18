using CineSeat.Application.Features.Cities.Commands.CreateCity;
using CineSeat.Application.Features.Cities.Commands.DeleteCity;
using CineSeat.Application.Features.Cities.Commands.UpdateCity;
using CineSeat.Application.Features.Cities.Queries.GetAllCities;
using CineSeat.Application.Features.Cities.Queries.GetCityById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitiesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CitiesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllCitiesQuery()));

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
        => Ok(await _mediator.Send(new GetCityByIdQuery { Id = id }));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCityCommand command)
        => Ok(await _mediator.Send(command));

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateCityCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _mediator.Send(new DeleteCityCommand { Id = id });
        return NoContent();
    }
}
