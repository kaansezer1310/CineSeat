using FluentValidation;

namespace CineSeat.Application.Features.Cities.Queries.GetAllCities;

public class GetAllCitiesQueryValidator : AbstractValidator<GetAllCitiesQuery>
{
    public GetAllCitiesQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
