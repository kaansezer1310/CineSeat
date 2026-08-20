using MediatR;

namespace CineSeat.Application.Features.MovieGenres.Commands.RemoveGenreFromMovie;

public class RemoveGenreFromMovieCommand : IRequest<Unit>
{
    public long MovieId { get; set; }
    public long GenreId { get; set; }
}
