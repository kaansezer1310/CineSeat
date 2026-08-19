using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Commands.CreateCampaign;

public class CreateCampaignCommand : IRequest<long>
{
    public string Name { get; set; } = string.Empty;
    public CampaignType Type { get; set; }
    public decimal Value { get; set; }
    public decimal MinCartTotal { get; set; }
    public bool MembersOnly { get; set; }
    public bool IsActive { get; set; } = true;
}
