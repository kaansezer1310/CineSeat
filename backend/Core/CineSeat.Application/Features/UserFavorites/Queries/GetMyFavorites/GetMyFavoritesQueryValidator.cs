using FluentValidation;

namespace CineSeat.Application.Features.UserFavorites.Queries.GetMyFavorites;

public class GetMyFavoritesQueryValidator : AbstractValidator<GetMyFavoritesQuery>
{
    public GetMyFavoritesQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
