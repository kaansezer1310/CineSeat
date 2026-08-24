using FluentValidation;

namespace CineSeat.Application.Features.Comments.Commands.AddComment;

public class AddCommentCommandValidator : AbstractValidator<AddCommentCommand>
{
    public AddCommentCommandValidator()
    {
        RuleFor(x => x.MovieId).GreaterThan(0);

        // 1-5 yıldız. Movie.AvgScore kolonu precision(3,2) — bu aralık ona sığar.
        RuleFor(x => x.Rating)
            .InclusiveBetween((short)1, (short)5)
            .WithMessage("Puan 1 ile 5 arasında olmalıdır.");

        RuleFor(x => x.Content)
            .MaximumLength(1000).WithMessage("Yorum en fazla 1000 karakter olabilir.");
    }
}
