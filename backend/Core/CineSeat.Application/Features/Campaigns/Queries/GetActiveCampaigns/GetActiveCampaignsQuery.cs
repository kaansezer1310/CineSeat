using CineSeat.Application.Features.Campaigns.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Queries.GetActiveCampaigns;

/// <summary>
/// İstemciye gösterilecek kampanyalar. Üye olmayan ziyaretçilere MembersOnly
/// kampanyalar gösterilmez.
/// </summary>
public class GetActiveCampaignsQuery : IRequest<List<CampaignDto>>
{
}
