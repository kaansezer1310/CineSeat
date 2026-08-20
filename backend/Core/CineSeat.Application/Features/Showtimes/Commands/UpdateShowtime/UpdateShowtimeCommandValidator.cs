using FluentValidation;

namespace CineSeat.Application.Features.Showtimes.Commands.UpdateShowtime;

public class UpdateShowtimeCommandValidator : AbstractValidator<UpdateShowtimeCommand>
{
    public UpdateShowtimeCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.MovieId).GreaterThan(0).WithMessage("Geçerli bir film seçilmelidir.");
        RuleFor(x => x.HallId).GreaterThan(0).WithMessage("Geçerli bir salon seçilmelidir.");
        RuleFor(x => x.BasePrice).GreaterThan(0).WithMessage("Bilet fiyatı 0'dan büyük olmalıdır.");
        RuleFor(x => x.Format).IsInEnum().WithMessage("Geçerli bir gösterim formatı seçilmelidir.");
    }
}
