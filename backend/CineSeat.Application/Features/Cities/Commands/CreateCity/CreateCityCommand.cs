using MediatR;

namespace CineSeat.Application.Features.Cities.Commands.CreateCity;

public class CreateCityCommand : IRequest<long>
{
    public string CityName { get; set; } = string.Empty;
}
