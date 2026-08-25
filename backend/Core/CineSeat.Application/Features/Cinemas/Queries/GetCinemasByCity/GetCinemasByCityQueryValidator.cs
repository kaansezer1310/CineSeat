using FluentValidation;

namespace CineSeat.Application.Features.Cinemas.Queries.GetCinemasByCity;

public class GetCinemasByCityQueryValidator : AbstractValidator<GetCinemasByCityQuery>
{
    public GetCinemasByCityQueryValidator()
    {
        // CityId isteğe bağlı; verildiyse gerçek bir kaydı işaret etmeli.
        RuleFor(x => x.CityId)
            .GreaterThan(0).When(x => x.CityId.HasValue)
            .WithMessage("Geçerli bir şehir seçilmelidir.");

        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
