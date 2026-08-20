using MediatR;

namespace CineSeat.Application.Features.Technologies.Commands.DeleteTechnology;

public class DeleteTechnologyCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
