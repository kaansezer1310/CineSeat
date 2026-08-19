using CineSeat.Application.Features.SeatLocks.DTOs;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Queries.GetLockedSeatsByShowtime;

public class GetLockedSeatsByShowtimeQuery : IRequest<List<SeatLockDto>>
{
    public long ShowtimeId { get; set; }
}
