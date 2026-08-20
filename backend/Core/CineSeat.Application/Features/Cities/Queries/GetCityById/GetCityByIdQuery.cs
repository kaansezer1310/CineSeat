using CineSeat.Application.Features.Cities.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Cities.Queries.GetCityById;

public class GetCityByIdQuery : IRequest<CityDto>
{
    public long Id { get; set; }
}
