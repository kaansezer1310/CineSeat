using FluentValidation;

namespace CineSeat.Application.Features.MovieGenres.Commands.AssignGenreToMovie;

public class AssignGenreToMovieCommandValidator : AbstractValidator<AssignGenreToMovieCommand>
{
    public AssignGenreToMovieCommandValidator()
    {
        RuleFor(x => x.MovieId).GreaterThan(0);
        RuleFor(x => x.GenreId).GreaterThan(0);
    }
}
