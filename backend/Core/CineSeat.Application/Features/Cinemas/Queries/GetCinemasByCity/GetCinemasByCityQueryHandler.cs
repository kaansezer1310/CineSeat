using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Cinemas.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Queries.GetCinemasByCity;

public class GetCinemasByCityQueryHandler : IRequestHandler<GetCinemasByCityQuery, PagedResult<CinemaDto>>
{
    private readonly ICinemaReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetCinemasByCityQueryHandler(ICinemaReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<PagedResult<CinemaDto>> Handle(
        GetCinemasByCityQuery request, CancellationToken cancellationToken)
    {
        // Sinema → İlçe → Şehir: navigation üzerinden filtre (EF SQL'e JOIN olarak çevirir).
        var baseQuery = _read.GetWhere(c => c.District.CityId == request.CityId, tracking: false);

        var totalCount = await _executor.CountAsync(baseQuery, cancellationToken);

        var pageQuery = baseQuery
            .OrderBy(c => c.Name)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CinemaDto
            {
                Id = c.Id,
                Name = c.Name,
                Address = c.Address,
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                DistrictId = c.DistrictId
            });

        var items = await _executor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<CinemaDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
