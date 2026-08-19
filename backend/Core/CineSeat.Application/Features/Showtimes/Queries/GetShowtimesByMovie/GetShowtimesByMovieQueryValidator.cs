using FluentValidation;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByMovie;

public class GetShowtimesByMovieQueryValidator : AbstractValidator<GetShowtimesByMovieQuery>
{
    public GetShowtimesByMovieQueryValidator()
    {
        RuleFor(x => x.MovieId).GreaterThan(0);
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
