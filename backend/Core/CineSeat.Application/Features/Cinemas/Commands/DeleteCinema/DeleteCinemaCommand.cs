using MediatR;

namespace CineSeat.Application.Features.Cinemas.Commands.DeleteCinema;

public class DeleteCinemaCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
