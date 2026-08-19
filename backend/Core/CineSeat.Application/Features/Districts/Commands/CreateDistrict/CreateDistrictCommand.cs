using MediatR;

namespace CineSeat.Application.Features.Districts.Commands.CreateDistrict;

public class CreateDistrictCommand : IRequest<long>
{
    public string DistrictName { get; set; } = string.Empty;
    public long CityId { get; set; }
}
