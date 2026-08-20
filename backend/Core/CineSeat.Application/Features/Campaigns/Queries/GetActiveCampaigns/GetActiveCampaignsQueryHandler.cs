using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Campaigns.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Campaigns.Queries.GetActiveCampaigns;

public class GetActiveCampaignsQueryHandler : IRequestHandler<GetActiveCampaignsQuery, List<CampaignDto>>
{
    private readonly ICampaignReadRepository _read;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetActiveCampaignsQueryHandler(
        ICampaignReadRepository read,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor queryExecutor)
    {
        _read = read;
        _currentUser = currentUser;
        _queryExecutor = queryExecutor;
    }

    public async Task<List<CampaignDto>> Handle(
        GetActiveCampaignsQuery request, CancellationToken cancellationToken)
    {
        var isMember = _currentUser.IsAuthenticated;

        var query = _read.GetWhere(c => c.IsActive && (!c.MembersOnly || isMember), tracking: false)
            .OrderBy(c => c.MinCartTotal)
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
