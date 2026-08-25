using System;
using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class SeatLock : BaseEntity
    {
        public long ShowtimeId { get; set; }
        public Showtime Showtime { get; set; } = null!;

        public long SeatId { get; set; }
        public Seat Seat { get; set; } = null!;

        public long UserId { get; set; }
        public User User { get; set; } = null!;

        public DateTimeOffset LockExpiresAt { get; set; }
    }
}
