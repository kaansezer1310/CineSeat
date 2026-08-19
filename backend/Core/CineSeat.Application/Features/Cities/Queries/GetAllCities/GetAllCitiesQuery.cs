using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Cities.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Cities.Queries.GetAllCities;

public class GetAllCitiesQuery : IRequest<PagedResult<CityDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
