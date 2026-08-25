using FluentValidation;

namespace CineSeat.Application.Features.Movies.Queries.GetMovies;

/// <summary>
/// Sayfa boyutu sinirsizdi: pageSize=999999 kabul ediliyor ve tek istekte
/// tablonun tamami cekilebiliyordu. Diger sayfali uclarla ayni sinira baglandi.
/// </summary>
public class GetMoviesQueryValidator : AbstractValidator<GetMoviesQuery>
{
    public GetMoviesQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.Search).MaximumLength(200).When(x => x.Search is not null);
    }
}
