using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Cities.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Cities.Queries.GetCityById;

public class GetCityByIdQueryHandler : IRequestHandler<GetCityByIdQuery, CityDto>
{
    private readonly ICityReadRepository _read;

    public GetCityByIdQueryHandler(ICityReadRepository read) => _read = read;

    public async Task<CityDto> Handle(GetCityByIdQuery request, CancellationToken cancellationToken)
    {
        var city = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (city is null)
            throw new NotFoundException("Şehir", request.Id);

        return new CityDto { Id = city.Id, CityName = city.CityName };
    }
}
