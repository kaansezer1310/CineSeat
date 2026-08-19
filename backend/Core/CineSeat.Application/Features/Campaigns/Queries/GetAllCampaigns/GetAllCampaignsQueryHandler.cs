using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Campaigns.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Queries.GetAllCampaigns;

public class GetAllCampaignsQueryHandler : IRequestHandler<GetAllCampaignsQuery, List<CampaignDto>>
{
    private readonly ICampaignReadRepository _read;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetAllCampaignsQueryHandler(ICampaignReadRepository read, IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _queryExecutor = queryExecutor;
    }

    public async Task<List<CampaignDto>> Handle(GetAllCampaignsQuery request, CancellationToken cancellationToken)
    {
        var query = _read.GetAll(tracking: false)
            .OrderByDescending(c => c.IsActive)
            .ThenBy(c => c.Name)
            .Select(c => new CampaignDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type,
                Value = c.Value,
                MinCartTotal = c.MinCartTotal,
                MembersOnly = c.MembersOnly,
                IsActive = c.IsActive
            });

        return await _queryExecutor.ToListAsync(query, cancellationToken);
    }
}
