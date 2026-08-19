using CineSeat.Domain.Enums;
using FluentValidation;

namespace CineSeat.Application.Features.Campaigns.Commands.UpdateCampaign;

public class UpdateCampaignCommandValidator : AbstractValidator<UpdateCampaignCommand>
{
    public UpdateCampaignCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Kampanya adı boş olamaz.")
            .MaximumLength(150);

        RuleFor(x => x.Type).IsInEnum().WithMessage("Geçersiz kampanya tipi.");

        RuleFor(x => x.Value)
            .GreaterThan(0).WithMessage("İndirim değeri 0'dan büyük olmalıdır.");

        RuleFor(x => x.Value)
            .LessThanOrEqualTo(100).WithMessage("Yüzde indirim 100'ü aşamaz.")
            .When(x => x.Type == CampaignType.Percentage);

        RuleFor(x => x.MinCartTotal)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum sepet tutarı negatif olamaz.");
    }
}
