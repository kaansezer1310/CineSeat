using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;
using CineSeat.Domain.Enums;

namespace CineSeat.Domain.Entities
{
    public class Reservation : BaseEntity
    {
        public required string ResNo { get; set; }

        public long UserId { get; set; }
        public User User { get; set; } = null!;

        public long ShowtimeId { get; set; }
        public Showtime Showtime { get; set; } = null!;

        // Kampanya isteğe bağlı: CampaignId null olabildiği için ilişki de
        // nullable. Kampanyasız rezervasyon geçerli bir durum.
        public long? CampaignId { get; set; }
        public Campaign? Campaign { get; set; }

        public required string BuyerFname { get; set; }
        public required string BuyerLname { get; set; }
        public required string BuyerEmail { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public ReservationStatus Status { get; set; }

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
