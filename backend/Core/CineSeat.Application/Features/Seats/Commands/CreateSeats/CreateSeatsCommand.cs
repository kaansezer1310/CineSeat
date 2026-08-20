using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Seats.Commands.CreateSeats;

// Toplu koltuk üretimi: HallId için RowCount x ColumnCount ızgarasında koltuk oluşturur.
// Var olan (Row, Column) çiftleri handler'da atlanır — aynı salon için tekrar çağrılırsa
// hata vermez, sadece eksik koltukları tamamlar.
public class CreateSeatsCommand : IRequest<int>
{
    public long HallId { get; set; }
    public short RowCount { get; set; }
    public short ColumnCount { get; set; }
    public SeatType DefaultType { get; set; } = SeatType.Regular;
}
