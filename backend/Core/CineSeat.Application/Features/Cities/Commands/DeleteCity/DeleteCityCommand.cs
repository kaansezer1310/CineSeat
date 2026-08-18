using MediatR;

namespace CineSeat.Application.Features.Cities.Commands.DeleteCity;

public class DeleteCityCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
