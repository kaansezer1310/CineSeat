using CineSeat.Application.Features.Districts.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Districts.Queries.GetDistrictsByCity;

public class GetDistrictsByCityQuery : IRequest<List<DistrictDto>>
{
    public long CityId { get; set; }
}
