using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Campaigns.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Queries.GetCampaignById;

public class GetCampaignByIdQueryHandler : IRequestHandler<GetCampaignByIdQuery, CampaignDto>
{
    private readonly ICampaignReadRepository _read;

    public GetCampaignByIdQueryHandler(ICampaignReadRepository read) => _read = read;

    public async Task<CampaignDto> Handle(GetCampaignByIdQuery request, CancellationToken cancellationToken)
    {
        var campaign = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (campaign is null)
            throw new NotFoundException("Kampanya", request.Id);

        return new CampaignDto
        {
            Id = campaign.Id,
            Name = campaign.Name,
            Type = campaign.Type,
            Value = campaign.Value,
            MinCartTotal = campaign.MinCartTotal,
            MembersOnly = campaign.MembersOnly,
            IsActive = campaign.IsActive
        };
    }
}
