using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Seats.Commands.UpdateSeat;

public class UpdateSeatCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public SeatType Type { get; set; }
    public bool IsActive { get; set; }
}
