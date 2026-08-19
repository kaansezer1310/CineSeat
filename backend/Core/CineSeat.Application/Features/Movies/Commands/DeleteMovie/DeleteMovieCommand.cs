using MediatR;

namespace CineSeat.Application.Features.Movies.Commands.DeleteMovie;

public class DeleteMovieCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
