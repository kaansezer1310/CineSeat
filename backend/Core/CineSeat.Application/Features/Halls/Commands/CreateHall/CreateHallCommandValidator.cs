using FluentValidation;

namespace CineSeat.Application.Features.Halls.Commands.CreateHall;

public class CreateHallCommandValidator : AbstractValidator<CreateHallCommand>
{
    public CreateHallCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Salon adı boş olamaz.")
            .MaximumLength(100).WithMessage("Salon adı en fazla 100 karakter olabilir.");
        RuleFor(x => x.CinemaId)
            .GreaterThan(0).WithMessage("Geçerli bir sinema seçilmelidir.");
    }
}
