using FluentValidation;

namespace CineSeat.Application.Features.UserFavorites.Commands.AddFavorite;

public class AddFavoriteCommandValidator : AbstractValidator<AddFavoriteCommand>
{
    public AddFavoriteCommandValidator()
    {
        RuleFor(x => x.MovieId).GreaterThan(0);
    }
}
