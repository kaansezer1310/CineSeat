namespace CineSeat.Application.Features.Districts.DTOs;

public class DistrictDto
{
    public long Id { get; set; }
    public string DistrictName { get; set; } = string.Empty;
    public long CityId { get; set; }
}
