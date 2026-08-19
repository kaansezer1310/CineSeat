using CineSeat.Domain.Enums;

namespace CineSeat.Application.Features.Tickets.DTOs;

public class TicketDto
{
    public long Id { get; set; }
    public long ReservationId { get; set; }
    public long SeatId { get; set; }
    public TicketType TicketType { get; set; }
    public decimal Price { get; set; }
}
