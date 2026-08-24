using FluentValidation;

namespace CineSeat.Application.Features.SeatLocks.Commands.RenewSeatLocks;

public class RenewSeatLocksCommandValidator : AbstractValidator<RenewSeatLocksCommand>
{
    public RenewSeatLocksCommandValidator()
    {
        RuleFor(x => x.ShowtimeId).GreaterThan(0);

        RuleFor(x => x.SeatIds)
            .NotEmpty().WithMessage("En az bir koltuk belirtilmelidir.");

        // Ust sinir, tek istekle sinirsiz sure uzatilmasini engeller.
        RuleFor(x => x.LockMinutes)
            .InclusiveBetween(1, 30)
            .WithMessage("Kilit suresi 1 ile 30 dakika arasinda olmalidir.");
    }
}
