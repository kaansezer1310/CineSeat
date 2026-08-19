using MediatR;

namespace CineSeat.Application.Features.Halls.Commands.CreateHall;

public class CreateHallCommand : IRequest<long>
{
    public string Name { get; set; } = string.Empty;
    public long CinemaId { get; set; }
}
