using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using CineSeat.Application.Features.Cities.DTOs;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CineSeat.Application.Features.Cities.Queries.GetAllCities;

public class GetAllCitiesQueryHandler : IRequestHandler<GetAllCitiesQuery, List<CityDto>>
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

    public async Task<List<CityDto>> Handle(GetAllCitiesQuery request, CancellationToken cancellationToken)
    {
        var query = _cityReadRepository.GetAll(false)
            .Select(c => new CityDto
            {
                Id = c.Id,
                CityName = c.CityName
            });

        return await _queryExecutor.ToListAsync(query, cancellationToken);
    }
}
