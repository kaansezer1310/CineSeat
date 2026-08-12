using CineSeat.Application.Features.Cities.DTOs;
using MediatR;
using System.Collections.Generic;

namespace CineSeat.Application.Features.Cities.Queries.GetAllCities;

public class GetAllCitiesQuery : IRequest<List<CityDto>>
{
}
