namespace CineSeat.Models
{
    public enum ReservationStatus
    {
        Pending,
        Completed,
        Cancelled
    }

    public class Reservation
    {
        public long ReservationId { get; set; }
        public string ResNo { get; set; }
        public long UserId { get; set; }
        public long ShowtimeId { get; set; }
        public long? CampaignId { get; set; }
        public string BuyerFname { get; set; } 
        public string BuyerLname { get; set; }
        public string BuyerEmail { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
        public ReservationStatus Status { get; set; }
    }
}