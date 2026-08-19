using FluentValidation;

namespace CineSeat.Application.Features.Districts.Commands.UpdateDistrict;

public class UpdateDistrictCommandValidator : AbstractValidator<UpdateDistrictCommand>
{
    public UpdateDistrictCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.DistrictName)
            .NotEmpty().WithMessage("İlçe adı boş olamaz.")
            .MaximumLength(100).WithMessage("İlçe adı en fazla 100 karakter olabilir.");
        RuleFor(x => x.CityId)
            .GreaterThan(0).WithMessage("Geçerli bir şehir seçilmelidir.");
    }
}
