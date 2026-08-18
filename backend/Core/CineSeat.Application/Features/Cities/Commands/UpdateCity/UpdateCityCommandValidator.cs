using FluentValidation;

namespace CineSeat.Application.Features.Cities.Commands.UpdateCity;

public class UpdateCityCommandValidator : AbstractValidator<UpdateCityCommand>
{
    public UpdateCityCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.CityName)
            .NotEmpty().WithMessage("Şehir adı boş olamaz.")
            .MaximumLength(100).WithMessage("Şehir adı en fazla 100 karakter olabilir.");
    }
}
