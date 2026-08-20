using FluentValidation;

namespace CineSeat.Application.Features.Genres.Commands.UpdateGenre;

public class UpdateGenreCommandValidator : AbstractValidator<UpdateGenreCommand>
{
    public UpdateGenreCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tür adı boş olamaz.")
            .MaximumLength(50).WithMessage("Tür adı en fazla 50 karakter olabilir.");
    }
}
