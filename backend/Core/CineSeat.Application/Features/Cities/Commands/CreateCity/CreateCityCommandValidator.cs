using FluentValidation;

namespace CineSeat.Application.Features.Cities.Commands.CreateCity;

public class CreateCityCommandValidator : AbstractValidator<CreateCityCommand>
{
    public CreateCityCommandValidator()
    {
        RuleFor(x => x.CityName)
            .NotEmpty().WithMessage("Şehir adı boş olamaz.")
            .MaximumLength(100).WithMessage("Şehir adı en fazla 100 karakter olabilir.");
    }
}
