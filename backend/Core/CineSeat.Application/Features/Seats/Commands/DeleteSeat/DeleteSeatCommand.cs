using MediatR;

namespace CineSeat.Application.Features.Seats.Commands.DeleteSeat;

public class DeleteSeatCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
