using FluentValidation;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByCinema;

public class GetShowtimesByCinemaQueryValidator : AbstractValidator<GetShowtimesByCinemaQuery>
{
    public GetShowtimesByCinemaQueryValidator()
    {
        RuleFor(x => x.CinemaId).GreaterThan(0);
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
