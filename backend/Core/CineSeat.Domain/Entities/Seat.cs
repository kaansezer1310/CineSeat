using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;
using CineSeat.Domain.Enums;

namespace CineSeat.Domain.Entities
{
    public class Seat : BaseEntity
    {
        public SeatType Type { get; set; }

        public long HallId { get; set; }
        public Hall Hall { get; set; } = null!;

        public short SeatRow { get; set; }
        public short SeatColumn { get; set; }
        public bool IsActive { get; set; }

        public ICollection<SeatLock> SeatLocks { get; set; } = new List<SeatLock>();
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
