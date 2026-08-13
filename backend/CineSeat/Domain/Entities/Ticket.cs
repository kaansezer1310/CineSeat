using CineSeat.Domain.Common;
using CineSeat.Domain.Enums;

namespace CineSeat.Domain.Entities
{
    public class Ticket : BaseEntity
    {
        public long ReservationId { get; set; }
        public Reservation Reservation { get; set; }

        public long SeatId { get; set; }
        public Seat Seat { get; set; }

        public TicketType TicketType { get; set; }
        public decimal Price { get; set; }
    }
}
