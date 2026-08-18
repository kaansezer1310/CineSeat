using MediatR;

namespace CineSeat.Application.Features.Cinemas.Commands.UpdateCinema;

public class UpdateCinemaCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public long DistrictId { get; set; }
}
