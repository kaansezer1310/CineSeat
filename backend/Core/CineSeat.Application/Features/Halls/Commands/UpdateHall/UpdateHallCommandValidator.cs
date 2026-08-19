using FluentValidation;

namespace CineSeat.Application.Features.Halls.Commands.UpdateHall;

public class UpdateHallCommandValidator : AbstractValidator<UpdateHallCommand>
{
    public UpdateHallCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Salon adı boş olamaz.")
            .MaximumLength(100).WithMessage("Salon adı en fazla 100 karakter olabilir.");
        RuleFor(x => x.CinemaId)
            .GreaterThan(0).WithMessage("Geçerli bir sinema seçilmelidir.");
    }
}
