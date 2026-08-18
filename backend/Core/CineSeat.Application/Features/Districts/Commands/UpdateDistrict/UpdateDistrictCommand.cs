using MediatR;

namespace CineSeat.Application.Features.Districts.Commands.UpdateDistrict;

public class UpdateDistrictCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public string DistrictName { get; set; } = string.Empty;
    public long CityId { get; set; }
}
