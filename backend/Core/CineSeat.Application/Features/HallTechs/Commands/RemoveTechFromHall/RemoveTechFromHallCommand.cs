using MediatR;

namespace CineSeat.Application.Features.HallTechs.Commands.RemoveTechFromHall;

public class RemoveTechFromHallCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
