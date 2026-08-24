using FluentValidation;

namespace CineSeat.Application.Features.Reservations.Queries.GetReservations;

public class GetReservationsQueryValidator : AbstractValidator<GetReservationsQuery>
{
    public GetReservationsQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        RuleFor(x => x.MovieId).GreaterThan(0).When(x => x.MovieId.HasValue);
        RuleFor(x => x.Status).IsInEnum().When(x => x.Status.HasValue);
        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From)
            .When(x => x.From.HasValue && x.To.HasValue)
            .WithMessage("Bitiş tarihi başlangıç tarihinden önce olamaz.");
    }
}
