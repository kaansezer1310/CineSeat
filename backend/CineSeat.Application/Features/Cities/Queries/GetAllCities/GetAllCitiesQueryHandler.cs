using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Cities.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CineSeat.Application.Features.Cities.Queries.GetAllCities;

public class GetAllCitiesQueryHandler : IRequestHandler<GetAllCitiesQuery, List<CityDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllCitiesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CityDto>> Handle(GetAllCitiesQuery request, CancellationToken cancellationToken)
    {
        var cities = await _context.Cities
            .Select(c => new CityDto
            {
                Id = c.Id,
                CityName = c.CityName
            })
            .ToListAsync(cancellationToken);

        return cities;
    }
}
