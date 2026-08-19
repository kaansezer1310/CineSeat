using MediatR;

namespace CineSeat.Application.Features.Technologies.Commands.CreateTechnology;

public class CreateTechnologyCommand : IRequest<long>
{
    public string Name { get; set; } = string.Empty;
}
