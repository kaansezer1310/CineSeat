using FluentValidation;

namespace CineSeat.Application.Features.Districts.Commands.CreateDistrict;

public class CreateDistrictCommandValidator : AbstractValidator<CreateDistrictCommand>
{
    public CreateDistrictCommandValidator()
    {
        RuleFor(x => x.DistrictName)
            .NotEmpty().WithMessage("İlçe adı boş olamaz.")
            .MaximumLength(100).WithMessage("İlçe adı en fazla 100 karakter olabilir.");

        RuleFor(x => x.CityId)
            .GreaterThan(0).WithMessage("Geçerli bir şehir seçilmelidir.");
    }
}
