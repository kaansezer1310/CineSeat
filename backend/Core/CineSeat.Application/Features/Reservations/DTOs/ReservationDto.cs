using CineSeat.Application.Features.Tickets.DTOs;
using CineSeat.Domain.Enums;

namespace CineSeat.Application.Features.Reservations.DTOs;

public class ReservationDto
{
    public long Id { get; set; }
    public string ResNo { get; set; } = string.Empty;
    public long ShowtimeId { get; set; }
    public long? CampaignId { get; set; }
    public string BuyerFname { get; set; } = string.Empty;
    public string BuyerLname { get; set; } = string.Empty;
    public string BuyerEmail { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public ReservationStatus Status { get; set; }
    public List<TicketDto> Tickets { get; set; } = new();
}
