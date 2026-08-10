using System.Collections.Generic;
using CineSeat.Domain.Entities.Common;
using CineSeat.Domain.Enums;

namespace CineSeat.Domain.Entities
{
    public class Reservation : BaseEntity
    {
        public string ResNo { get; set; }
        
        public long UserId { get; set; }
        public User User { get; set; }
        
        public long ShowtimeId { get; set; }
        public Showtime Showtime { get; set; }
        
        public long? CampaignId { get; set; }
        public Campaign Campaign { get; set; }
        
        public string BuyerFname { get; set; } 
        public string BuyerLname { get; set; }
        public string BuyerEmail { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public ReservationStatus Status { get; set; }

        public ICollection<Ticket> Tickets { get; set; }
    }
}