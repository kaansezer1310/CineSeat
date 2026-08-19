namespace CineSeat.Application.Features.HallTechs.DTOs;

public class HallTechDto
{
    public long Id { get; set; }
    public long HallId { get; set; }
    public long TechnologyId { get; set; }
    public string TechnologyName { get; set; } = string.Empty;
}
