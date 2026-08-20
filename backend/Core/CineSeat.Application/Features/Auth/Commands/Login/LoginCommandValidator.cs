using FluentValidation;

namespace CineSeat.Application.Features.Auth.Commands.Login;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.UsernameOrEmail).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Password).NotEmpty().MaximumLength(100);
    }
}
