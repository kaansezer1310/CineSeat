using MediatR;

namespace CineSeat.Application.Features.Cities.Commands.UpdateCity;

public class UpdateCityCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public string CityName { get; set; } = string.Empty;
}
