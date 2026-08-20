using CineSeat.Domain.Enums;

namespace CineSeat.Application.Features.Seats.DTOs;

public class SeatDto
{
    public long Id { get; set; }
    public SeatType Type { get; set; }
    public long HallId { get; set; }
    public short SeatRow { get; set; }
    public short SeatColumn { get; set; }
    public bool IsActive { get; set; }
}
