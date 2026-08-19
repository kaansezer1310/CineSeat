namespace CineSeat.Application.Features.Cinemas.DTOs;

public class CinemaDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public long DistrictId { get; set; }
}
