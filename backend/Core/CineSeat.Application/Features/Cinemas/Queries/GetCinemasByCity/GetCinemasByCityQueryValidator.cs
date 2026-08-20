using FluentValidation;

namespace CineSeat.Application.Features.Cinemas.Queries.GetCinemasByCity;

public class GetCinemasByCityQueryValidator : AbstractValidator<GetCinemasByCityQuery>
{
    public GetCinemasByCityQueryValidator()
    {
        RuleFor(x => x.CityId).GreaterThan(0);
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
