using FluentValidation;

namespace CineSeat.Application.Features.Cinemas.Commands.UpdateCinema;

public class UpdateCinemaCommandValidator : AbstractValidator<UpdateCinemaCommand>
{
    public UpdateCinemaCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Sinema adı boş olamaz.")
            .MaximumLength(150).WithMessage("Sinema adı en fazla 150 karakter olabilir.");
        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Adres boş olamaz.");
        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90m, 90m).WithMessage("Enlem -90 ile 90 arasında olmalıdır.");
        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180m, 180m).WithMessage("Boylam -180 ile 180 arasında olmalıdır.");
        RuleFor(x => x.DistrictId)
            .GreaterThan(0).WithMessage("Geçerli bir ilçe seçilmelidir.");
    }
}
