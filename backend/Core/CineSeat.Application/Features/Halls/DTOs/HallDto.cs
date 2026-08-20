namespace CineSeat.Application.Features.Halls.DTOs;

public class HallDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public long CinemaId { get; set; }
}
