using CineSeat.Domain.Enums;

namespace CineSeat.Application.Features.Showtimes.DTOs;

public class ShowtimeDto
{
    public long Id { get; set; }
    public long MovieId { get; set; }
    public long HallId { get; set; }
    public DateTimeOffset StartDatetime { get; set; }
    public decimal BasePrice { get; set; }
    public ScreeningFormat Format { get; set; }
}
