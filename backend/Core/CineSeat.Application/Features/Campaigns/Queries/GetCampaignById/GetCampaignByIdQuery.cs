using CineSeat.Application.Features.Campaigns.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Queries.GetCampaignById;

public class GetCampaignByIdQuery : IRequest<CampaignDto>
{
    public long Id { get; set; }
}
