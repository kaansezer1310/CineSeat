using CineSeat.Application.Common.Constants;
using CineSeat.Application.Features.Campaigns.Commands.CreateCampaign;
using CineSeat.Application.Features.Campaigns.Commands.DeleteCampaign;
using CineSeat.Application.Features.Campaigns.Commands.UpdateCampaign;
using CineSeat.Application.Features.Campaigns.DTOs;
using CineSeat.Application.Features.Campaigns.Queries.GetActiveCampaigns;
using CineSeat.Application.Features.Campaigns.Queries.GetAllCampaigns;
using CineSeat.Application.Features.Campaigns.Queries.GetCampaignById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CampaignsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// İstemciye gösterilecek aktif kampanyalar. Anonim erişime açık ama
    /// giriş yapılmışsa üyeye özel kampanyalar da listeye dahil olur.
    /// </summary>
    [HttpGet("active")]
    [ProducesResponseType(typeof(List<CampaignDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActive(CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetActiveCampaignsQuery(), cancellationToken));

    /// <summary>Pasifler dahil tüm kampanyalar — yönetim ekranı.</summary>
    [HttpGet]
    [Authorize(Policy = PermissionNames.CampaignManage)]
    [ProducesResponseType(typeof(List<CampaignDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetAllCampaignsQuery(), cancellationToken));

    [HttpGet("{id:long}")]
    [Authorize(Policy = PermissionNames.CampaignManage)]
    [ProducesResponseType(typeof(CampaignDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
        => Ok(await _mediator.Send(new GetCampaignByIdQuery { Id = id }, cancellationToken));

    [HttpPost]
    [Authorize(Policy = PermissionNames.CampaignManage)]
    public async Task<IActionResult> Create(
        [FromBody] CreateCampaignCommand command, CancellationToken cancellationToken)
    {
        var id = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:long}")]
    [Authorize(Policy = PermissionNames.CampaignManage)]
    public async Task<IActionResult> Update(
        long id, [FromBody] UpdateCampaignCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        await _mediator.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    [Authorize(Policy = PermissionNames.CampaignManage)]
    public async Task<IActionResult> Delete(long id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteCampaignCommand { Id = id }, cancellationToken);
        return NoContent();
    }
}
