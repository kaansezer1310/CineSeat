using CineSeat.Domain.Enums;

namespace CineSeat.Application.Features.Campaigns.DTOs;

public class CampaignDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CampaignType Type { get; set; }

    /// <summary>Type=Percentage ise yüzde (örn. 10), FixedAmount ise TL tutarı.</summary>
    public decimal Value { get; set; }

    public decimal MinCartTotal { get; set; }
    public bool MembersOnly { get; set; }
    public bool IsActive { get; set; }
}
