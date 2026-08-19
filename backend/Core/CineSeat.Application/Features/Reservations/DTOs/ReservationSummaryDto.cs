using CineSeat.Domain.Enums;

namespace CineSeat.Application.Features.Reservations.DTOs;

public class ReservationSummaryDto
{
    public long Id { get; set; }
    public string ResNo { get; set; } = string.Empty;
    public long ShowtimeId { get; set; }
    public DateTimeOffset ShowtimeStart { get; set; }
    public string MovieTitle { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public ReservationStatus Status { get; set; }
}
