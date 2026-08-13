using System.Collections.Generic;
using CineSeat.Domain.Common;
using CineSeat.Domain.Enums;

namespace CineSeat.Domain.Entities
{
    public class Seat : BaseEntity
    {
        public SeatType Type { get; set; }

        public long HallId { get; set; }
        public Hall Hall { get; set; }

        public short SeatRow { get; set; }
        public short SeatColumn { get; set; }
        public bool IsActive { get; set; }

        public ICollection<SeatLock> SeatLocks { get; set; }
        public ICollection<Ticket> Tickets { get; set; }
    }
}
