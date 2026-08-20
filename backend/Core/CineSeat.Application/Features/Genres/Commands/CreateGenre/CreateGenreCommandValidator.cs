using FluentValidation;

namespace CineSeat.Application.Features.Genres.Commands.CreateGenre;

public class CreateGenreCommandValidator : AbstractValidator<CreateGenreCommand>
{
    public CreateGenreCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tür adı boş olamaz.")
            .MaximumLength(50).WithMessage("Tür adı en fazla 50 karakter olabilir.");
    }
}
