using FluentValidation;

namespace CineSeat.Application.Features.Reservations.Commands.CreateReservation;

public class CreateReservationCommandValidator : AbstractValidator<CreateReservationCommand>
{
    public CreateReservationCommandValidator()
    {
        RuleFor(x => x.UserId).GreaterThan(0).WithMessage("Geçerli bir kullanıcı olmalıdır.");
        RuleFor(x => x.ShowtimeId).GreaterThan(0).WithMessage("Geçerli bir seans seçilmelidir.");

        RuleFor(x => x.BuyerFname).NotEmpty().WithMessage("Alıcı adı boş olamaz.");
        RuleFor(x => x.BuyerLname).NotEmpty().WithMessage("Alıcı soyadı boş olamaz.");
        RuleFor(x => x.BuyerEmail).NotEmpty().EmailAddress().WithMessage("Geçerli bir e-posta giriniz.");

        RuleFor(x => x.Seats)
            .NotEmpty().WithMessage("En az bir koltuk seçilmelidir.");

        RuleForEach(x => x.Seats).ChildRules(seat =>
        {
            seat.RuleFor(s => s.SeatId).GreaterThan(0).WithMessage("Geçerli bir koltuk seçilmelidir.");
            seat.RuleFor(s => s.TicketType).IsInEnum().WithMessage("Geçerli bir bilet tipi seçilmelidir.");
        });
    }
}
