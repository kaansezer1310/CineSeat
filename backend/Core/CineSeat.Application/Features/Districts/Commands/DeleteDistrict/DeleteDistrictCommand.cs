using MediatR;

namespace CineSeat.Application.Features.Districts.Commands.DeleteDistrict;

public class DeleteDistrictCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
