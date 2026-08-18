using FluentValidation;

namespace CineSeat.Application.Features.Movies.Commands.CreateMovie;

/// <summary>
/// Bu sınıf hiçbir yerde elle çağrılmaz. Uygulama açılırken
/// <c>AddValidatorsFromAssembly</c> onu bulur, <c>ValidationBehavior</c> de
/// CreateMovieCommand her gönderildiğinde otomatik çalıştırır.
/// </summary>
public class CreateMovieCommandValidator : AbstractValidator<CreateMovieCommand>
{
    public CreateMovieCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Film adı boş olamaz.")
            .MaximumLength(200).WithMessage("Film adı en fazla 200 karakter olabilir.");

        RuleFor(x => x.Duration)
            .GreaterThan((short)0).WithMessage("Süre 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo((short)600).WithMessage("Süre 600 dakikayı aşamaz.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Açıklama boş olamaz.");

        RuleFor(x => x.AgeLimit)
            .InclusiveBetween((short)0, (short)21).WithMessage("Yaş sınırı 0 ile 21 arasında olmalıdır.");

        RuleFor(x => x.Language)
            .NotEmpty().WithMessage("Dil bilgisi boş olamaz.");

        RuleFor(x => x.Poster)
            .NotEmpty().WithMessage("Poster adresi boş olamaz.");

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate)
            .WithMessage("Vizyon bitiş tarihi, başlangıç tarihinden sonra olmalıdır.");
    }
}
