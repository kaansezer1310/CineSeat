namespace CineSeat.Application.Features.SeatLocks.DTOs;

public class SeatLockDto
{
    public long Id { get; set; }
    public long ShowtimeId { get; set; }
    public long SeatId { get; set; }
    public DateTimeOffset LockExpiresAt { get; set; }
}
