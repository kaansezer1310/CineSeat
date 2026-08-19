using CineSeat.Domain.Enums;
using FluentValidation;

namespace CineSeat.Application.Features.Campaigns.Commands.CreateCampaign;

public class CreateCampaignCommandValidator : AbstractValidator<CreateCampaignCommand>
{
    public CreateCampaignCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Kampanya adı boş olamaz.")
            .MaximumLength(150);

        RuleFor(x => x.Type)
            .IsInEnum().WithMessage("Geçersiz kampanya tipi.");

        RuleFor(x => x.Value)
            .GreaterThan(0).WithMessage("İndirim değeri 0'dan büyük olmalıdır.");

        // Yüzde indirimin 100'ü aşması negatif fiyata yol açardı.
        RuleFor(x => x.Value)
            .LessThanOrEqualTo(100).WithMessage("Yüzde indirim 100'ü aşamaz.")
            .When(x => x.Type == CampaignType.Percentage);

        RuleFor(x => x.MinCartTotal)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum sepet tutarı negatif olamaz.");
    }
}
