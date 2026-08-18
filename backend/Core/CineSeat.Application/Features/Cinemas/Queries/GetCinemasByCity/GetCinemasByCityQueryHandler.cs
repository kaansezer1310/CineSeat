using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Cinemas.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Queries.GetCinemasByCity;

public class GetCinemasByCityQueryHandler : IRequestHandler<GetCinemasByCityQuery, List<CinemaDto>>
{
    private readonly ICinemaReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetCinemasByCityQueryHandler(ICinemaReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<CinemaDto>> Handle(GetCinemasByCityQuery request, CancellationToken cancellationToken)
    {
        // Sinema → İlçe → Şehir: navigation üzerinden filtre (EF SQL'e JOIN olarak çevirir).
        var query = _read.GetWhere(c => c.District.CityId == request.CityId, tracking: false)
            .Select(c => new CinemaDto
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                DistrictId = c.DistrictId
            });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
