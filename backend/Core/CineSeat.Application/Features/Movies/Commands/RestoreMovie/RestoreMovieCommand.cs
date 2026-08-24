using MediatR;

namespace CineSeat.Application.Features.Movies.Commands.RestoreMovie;

public class RestoreMovieCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
