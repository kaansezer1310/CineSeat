using FluentValidation;

namespace CineSeat.Application.Features.Auth.Commands.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Surname).NotEmpty().MaximumLength(50);

        RuleFor(x => x.Username)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(30)
            .Matches("^[a-zA-Z0-9_.]+$")
            .WithMessage("Kullanıcı adı yalnızca harf, rakam, alt çizgi ve nokta içerebilir.");

        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Parola en az 8 karakter olmalıdır.")
            .MaximumLength(100)
            .Matches("[A-Za-z]").WithMessage("Parola en az bir harf içermelidir.")
            .Matches("[0-9]").WithMessage("Parola en az bir rakam içermelidir.");

        RuleFor(x => x.PhoneNum).MaximumLength(20).When(x => x.PhoneNum is not null);
        RuleFor(x => x.Gender).MaximumLength(20).When(x => x.Gender is not null);
    }
}
