using CineSeat.Application.Common.Constants;
using CineSeat.Application.Features.Districts.Commands.CreateDistrict;
using CineSeat.Application.Features.Districts.Commands.DeleteDistrict;
using CineSeat.Application.Features.Districts.Commands.UpdateDistrict;
using CineSeat.Application.Features.Districts.Queries.GetDistrictById;
using CineSeat.Application.Features.Districts.Queries.GetDistrictsByCity;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DistrictsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DistrictsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetByCity([FromQuery] long cityId)
        => Ok(await _mediator.Send(new GetDistrictsByCityQuery { CityId = cityId }));

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
        => Ok(await _mediator.Send(new GetDistrictByIdQuery { Id = id }));

    [Authorize(Policy = PermissionNames.CinemaManage)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDistrictCommand command)
        => Ok(await _mediator.Send(command));

    [Authorize(Policy = PermissionNames.CinemaManage)]
    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateDistrictCommand command)
    {
        command.Id = id;
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize(Policy = PermissionNames.CinemaManage)]
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _mediator.Send(new DeleteDistrictCommand { Id = id });
        return NoContent();
    }
}
