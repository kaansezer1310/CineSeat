using CineSeat.Application.Features.Districts.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Districts.Queries.GetDistrictById;

public class GetDistrictByIdQuery : IRequest<DistrictDto>
{
    public long Id { get; set; }
}
