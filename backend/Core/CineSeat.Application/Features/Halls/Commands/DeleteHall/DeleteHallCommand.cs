using MediatR;

namespace CineSeat.Application.Features.Halls.Commands.DeleteHall;

public class DeleteHallCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
