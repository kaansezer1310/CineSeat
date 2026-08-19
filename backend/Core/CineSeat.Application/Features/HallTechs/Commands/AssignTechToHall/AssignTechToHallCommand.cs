using MediatR;

namespace CineSeat.Application.Features.HallTechs.Commands.AssignTechToHall;

public class AssignTechToHallCommand : IRequest<long>
{
    public long HallId { get; set; }
    public long TechnologyId { get; set; }
}
