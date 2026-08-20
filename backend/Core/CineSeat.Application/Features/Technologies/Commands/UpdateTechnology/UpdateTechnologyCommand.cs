using MediatR;

namespace CineSeat.Application.Features.Technologies.Commands.UpdateTechnology;

public class UpdateTechnologyCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
