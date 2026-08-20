using MediatR;

namespace CineSeat.Application.Features.MovieGenres.Commands.AssignGenreToMovie;

public class AssignGenreToMovieCommand : IRequest<long>
{
    public long MovieId { get; set; }
    public long GenreId { get; set; }
}
