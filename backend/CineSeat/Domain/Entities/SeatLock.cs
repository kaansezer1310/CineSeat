using System;
using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class SeatLock : BaseEntity
    {
        public long ShowtimeId { get; set; }
        public Showtime Showtime { get; set; }

        public long SeatId { get; set; }
        public Seat Seat { get; set; }

        public long UserId { get; set; }
        public User User { get; set; }

        public DateTimeOffset LockExpiresAt { get; set; }
    }
}
