using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Commands.UpdateCampaign;

public class UpdateCampaignCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CampaignType Type { get; set; }
    public decimal Value { get; set; }
    public decimal MinCartTotal { get; set; }
    public bool MembersOnly { get; set; }
    public bool IsActive { get; set; }
}
