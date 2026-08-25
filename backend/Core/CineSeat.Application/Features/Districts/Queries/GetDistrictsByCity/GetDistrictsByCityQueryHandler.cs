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
        // Şehir verilmediyse süzgeç uygulanmaz; ilerideki şehir seçimi olmadan da
        // ilçe listesi çekilebilsin diye isteğe bağlı tutuluyor.
        var cityId = request.CityId;
        var source = cityId.HasValue
            ? _read.GetWhere(d => d.CityId == cityId.Value, tracking: false)
            : _read.GetAll(tracking: false);

        var query = source
            .Select(d => new DistrictDto
            {
                Id = d.Id,
                DistrictName = d.DistrictName,
                CityId = d.CityId
            });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
