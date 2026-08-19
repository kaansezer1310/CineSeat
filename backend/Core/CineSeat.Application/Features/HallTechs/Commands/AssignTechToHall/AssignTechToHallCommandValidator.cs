using FluentValidation;

namespace CineSeat.Application.Features.HallTechs.Commands.AssignTechToHall;

public class AssignTechToHallCommandValidator : AbstractValidator<AssignTechToHallCommand>
{
    public AssignTechToHallCommandValidator()
    {
        RuleFor(x => x.HallId).GreaterThan(0).WithMessage("Geçerli bir salon seçilmelidir.");
        RuleFor(x => x.TechnologyId).GreaterThan(0).WithMessage("Geçerli bir teknoloji seçilmelidir.");
    }
}
