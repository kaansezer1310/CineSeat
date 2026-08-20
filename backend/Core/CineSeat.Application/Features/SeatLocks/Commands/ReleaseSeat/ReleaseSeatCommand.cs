using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.ReleaseSeat;

public class ReleaseSeatCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
