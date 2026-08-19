using FluentValidation;

namespace CineSeat.Application.Features.SeatLocks.Commands.LockSeat;

public class LockSeatCommandValidator : AbstractValidator<LockSeatCommand>
{
    public LockSeatCommandValidator()
    {
        RuleFor(x => x.ShowtimeId).GreaterThan(0).WithMessage("Geçerli bir seans seçilmelidir.");
        RuleFor(x => x.SeatId).GreaterThan(0).WithMessage("Geçerli bir koltuk seçilmelidir.");
        RuleFor(x => x.UserId).GreaterThan(0).WithMessage("Geçerli bir kullanıcı olmalıdır.");
        RuleFor(x => x.LockMinutes)
            .InclusiveBetween(1, 30).WithMessage("Kilit süresi 1 ile 30 dakika arasında olmalıdır.");
    }
}
