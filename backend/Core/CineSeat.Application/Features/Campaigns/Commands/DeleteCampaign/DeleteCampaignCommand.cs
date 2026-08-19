using MediatR;

namespace CineSeat.Application.Features.Campaigns.Commands.DeleteCampaign;

public class DeleteCampaignCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
