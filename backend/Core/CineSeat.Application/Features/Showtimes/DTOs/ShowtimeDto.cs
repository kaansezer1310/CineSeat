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

    // Seans listesi ekranda salon adi ve kapasiteyle birlikte gosteriliyor.
    // Bunlar DTO'da tasinmazsa istemci her seans icin ayrica /halls/{id}
    // cagirmak zorunda kalir (liste basina N+1 istek).
    public string HallName { get; set; } = string.Empty;
    public string CinemaName { get; set; } = string.Empty;
    public int TotalSeats { get; set; }
}
