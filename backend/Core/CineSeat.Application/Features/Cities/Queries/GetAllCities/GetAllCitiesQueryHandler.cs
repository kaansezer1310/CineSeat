using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Repositories;
using CineSeat.Application.Features.Cities.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Cities.Queries.GetAllCities;

public class GetAllCitiesQueryHandler : IRequestHandler<GetAllCitiesQuery, PagedResult<CityDto>>
{
    private readonly ICityReadRepository _cityReadRepository;
    private readonly IAsyncQueryExecutor _queryExecutor;

    public GetAllCitiesQueryHandler(
        ICityReadRepository cityReadRepository,
        IAsyncQueryExecutor queryExecutor)
    {
        _cityReadRepository = cityReadRepository;
        _queryExecutor = queryExecutor;
    }

    public async Task<PagedResult<CityDto>> Handle(GetAllCitiesQuery request, CancellationToken cancellationToken)
    {
        var baseQuery = _cityReadRepository.GetAll(false);

        var totalCount = await _queryExecutor.CountAsync(baseQuery, cancellationToken);

        var pageQuery = baseQuery
            .OrderBy(c => c.CityName)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CityDto
            {
                Id = c.Id,
                CityName = c.CityName
            });

        var items = await _queryExecutor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<CityDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
