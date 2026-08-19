using FluentValidation;

namespace CineSeat.Application.Features.Users.Commands.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Surname).NotEmpty().MaximumLength(50);
        RuleFor(x => x.PhoneNum).MaximumLength(20).When(x => x.PhoneNum is not null);
        RuleFor(x => x.Gender).MaximumLength(20).When(x => x.Gender is not null);
    }
}
