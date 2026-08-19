using FluentValidation;

namespace CineSeat.Application.Features.Technologies.Commands.UpdateTechnology;

public class UpdateTechnologyCommandValidator : AbstractValidator<UpdateTechnologyCommand>
{
    public UpdateTechnologyCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Teknoloji adı boş olamaz.")
            .MaximumLength(100).WithMessage("Teknoloji adı en fazla 100 karakter olabilir.");
    }
}
