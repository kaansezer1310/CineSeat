using FluentValidation;

namespace CineSeat.Application.Features.Movies.Queries.GetArchivedMovies;

public class GetArchivedMoviesQueryValidator : AbstractValidator<GetArchivedMoviesQuery>
{
    public GetArchivedMoviesQueryValidator()
    {
        RuleFor(query => query.Page).GreaterThan(0);
        RuleFor(query => query.PageSize).InclusiveBetween(1, 100);
    }
}
