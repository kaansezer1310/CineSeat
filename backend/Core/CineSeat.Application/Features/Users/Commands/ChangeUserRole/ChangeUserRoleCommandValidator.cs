using FluentValidation;

namespace CineSeat.Application.Features.Users.Commands.ChangeUserRole;

public class ChangeUserRoleCommandValidator : AbstractValidator<ChangeUserRoleCommand>
{
    public ChangeUserRoleCommandValidator()
    {
        RuleFor(x => x.UserId).GreaterThan(0);
        RuleFor(x => x.RoleId).GreaterThan(0).WithMessage("Gecerli bir rol secilmelidir.");
    }
}
