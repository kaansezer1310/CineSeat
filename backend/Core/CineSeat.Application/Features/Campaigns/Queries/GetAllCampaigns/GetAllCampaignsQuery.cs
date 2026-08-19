using CineSeat.Application.Features.Campaigns.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Queries.GetAllCampaigns;

/// <summary>Yönetim ekranı için: pasif kampanyalar dahil hepsi.</summary>
public class GetAllCampaignsQuery : IRequest<List<CampaignDto>>
{
}
