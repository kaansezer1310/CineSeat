using FluentValidation;

namespace CineSeat.Application.Features.Technologies.Commands.CreateTechnology;

public class CreateTechnologyCommandValidator : AbstractValidator<CreateTechnologyCommand>
{
    public CreateTechnologyCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Teknoloji adı boş olamaz.")
            .MaximumLength(100).WithMessage("Teknoloji adı en fazla 100 karakter olabilir.");
    }
}
