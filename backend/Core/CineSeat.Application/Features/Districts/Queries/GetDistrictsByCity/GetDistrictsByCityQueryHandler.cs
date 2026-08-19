using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Districts.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Districts.Queries.GetDistrictsByCity;

public class GetDistrictsByCityQueryHandler : IRequestHandler<GetDistrictsByCityQuery, List<DistrictDto>>
{
    private readonly IDistrictReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetDistrictsByCityQueryHandler(IDistrictReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<DistrictDto>> Handle(GetDistrictsByCityQuery request, CancellationToken cancellationToken)
    {
        var query = _read.GetWhere(d => d.CityId == request.CityId, tracking: false)
            .Select(d => new DistrictDto
            {
                Id = d.Id,
                DistrictName = d.DistrictName,
                CityId = d.CityId
            });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
