using FluentValidation;

namespace CineSeat.Application.Features.Reservations.Queries.GetMyReservations;

public class GetMyReservationsQueryValidator : AbstractValidator<GetMyReservationsQuery>
{
    public GetMyReservationsQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
