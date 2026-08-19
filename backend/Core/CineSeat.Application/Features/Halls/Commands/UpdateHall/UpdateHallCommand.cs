using MediatR;

namespace CineSeat.Application.Features.Halls.Commands.UpdateHall;

public class UpdateHallCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public long CinemaId { get; set; }
}
