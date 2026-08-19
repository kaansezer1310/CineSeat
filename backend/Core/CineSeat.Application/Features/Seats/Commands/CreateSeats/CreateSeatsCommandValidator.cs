using FluentValidation;

namespace CineSeat.Application.Features.Seats.Commands.CreateSeats;

public class CreateSeatsCommandValidator : AbstractValidator<CreateSeatsCommand>
{
    public CreateSeatsCommandValidator()
    {
        RuleFor(x => x.HallId).GreaterThan(0).WithMessage("Geçerli bir salon seçilmelidir.");
        RuleFor(x => x.RowCount)
            .GreaterThan((short)0).WithMessage("Satır sayısı 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo((short)100).WithMessage("Satır sayısı 100'ü aşamaz.");
        RuleFor(x => x.ColumnCount)
            .GreaterThan((short)0).WithMessage("Sütun sayısı 0'dan büyük olmalıdır.")
            .LessThanOrEqualTo((short)100).WithMessage("Sütun sayısı 100'ü aşamaz.");
    }
}
