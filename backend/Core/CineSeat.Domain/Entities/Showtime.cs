using System;
using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;
using CineSeat.Domain.Enums;

namespace CineSeat.Domain.Entities
{
    public class Showtime : BaseEntity
    {
        public long MovieId { get; set; }
        public Movie Movie { get; set; }

        public long HallId { get; set; }
        public Hall Hall { get; set; }

        public DateTimeOffset StartDatetime { get; set; }
        public decimal BasePrice { get; set; }
        public ScreeningFormat Format { get; set; }

        public ICollection<SeatLock> SeatLocks { get; set; }
        public ICollection<Reservation> Reservations { get; set; }
    }
}
